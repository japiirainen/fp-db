import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import { flow, identity, pipe } from 'fp-ts/lib/function'
import * as IO from 'fp-ts/lib/IOEither'
import RTE from 'fp-ts/lib/ReaderTaskEither'
import * as TE from 'fp-ts/lib/TaskEither'
import * as pg from 'pg'
import {
  isPoolCreationError,
  isTransactionRollbackError,
  makePoolCheckoutError,
  makePoolCreationError,
  makePoolShutdownError,
  makeUnhandledConnectionError,
  makeUnhandledPoolError,
  PoolCheckoutError,
  PoolCreationError,
  TypeParserSetupError,
  UnhandledConnectionError,
} from './errors'
import {
  Connection,
  ConnectionEnvironment,
  ConnectionError,
  ConnectionPool,
  ConnectionPoolConfig,
  ConnectionSymbol,
} from './types'
import { wrapPoolClient } from './connection'

export const makeConnectionPool = (
  poolConfig: ConnectionPoolConfig
): TE.TaskEither<PoolCreationError | TypeParserSetupError, ConnectionPool> => {
  const { onError, parsers } = poolConfig

  const poolIO = pipe(
    IO.tryCatch(() => {
      const pool = new pg.Pool(poolConfig)

      pool.on('error', flow(makeUnhandledPoolError, onError))

      return pool
    }, makePoolCreationError),
    IO.mapLeft((error) =>
      isPoolCreationError(error) ? error : makePoolCreationError(error)
    )
  )

  return pipe(
    poolIO,
    TE.fromIOEither,
    TE.mapLeft(identity),
    TE.chain((pool) =>
      pipe(
        O.fromNullable(parsers),
        O.map(setupParsers(pool)),
        O.getOrElse(() => TE.of(pool))
      )
    ),
    TE.map(wrapConnectionPool)
  )
}

const executeProgramWithConnection =
  <E extends {}, L, A>(
    env: E,
    program: RTE.ReaderTaskEither<E & ConnectionEnvironment, L, A>
  ) =>
  (connection: Connection) =>
    TE.tryCatch(
      () =>
        program({ ...env, [ConnectionSymbol]: connection })().then((res) =>
          pipe(
            res,
            E.fold(
              (err) => {
                connection.release(
                  isTransactionRollbackError(err) ? err : undefined
                )
                return err
              },
              (res) => {
                connection.release()
                return res
              }
            )
          )
        ),
      makeUnhandledConnectionError
    )

const checkoutConnection = (
  pool: pg.Pool
): TE.TaskEither<PoolCheckoutError | UnhandledConnectionError, pg.PoolClient> =>
  TE.tryCatch(() => pool.connect(), makePoolCheckoutError)

const withConnectionFromPool =
  (pool: pg.Pool) =>
  <L, A>(program: RTE.ReaderTaskEither<ConnectionEnvironment, L, A>) =>
    pipe(
      pool,
      checkoutConnection,
      TE.map(wrapPoolClient),
      TE.chain((foo) => executeProgramWithConnection({}, program)(foo))
    )

const withConnectionEFromPool =
  (pool: pg.Pool) =>
  <E extends {}, L, A>(
    program: RTE.ReaderTaskEither<ConnectionEnvironment & E, L, A>
  ) =>
    pipe(
      RTE.ask<E, ConnectionError<L>>(),
      RTE.map((env) =>
        pipe(
          pool,
          checkoutConnection,
          TE.chain(executeProgramWithConnection(env, program))
        )
      )
      // RTE.chain(RTE.fromTaskEither)
    )

export const wrapConnectionPool = (pool: pg.Pool): ConnectionPool => ({
  end: () =>
    TE.tryCatch(
      () => ((pool as any).ending ? Promise.resolve(undefined) : pool.end()),
      makePoolShutdownError
    ),

  withConnection: withConnectionFromPool(pool),
  withConnectionE: withConnectionEFromPool(pool),
})
