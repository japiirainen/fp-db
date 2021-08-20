import * as E from 'fp-ts/lib/Either'
import { flow } from 'fp-ts/lib/function'
import * as IO from 'fp-ts/lib/IOEither'
import * as TE from 'fp-ts/lib/TaskEither'
import * as pg from 'pg'
import {
  makePoolCreationError,
  makeUnhandledPoolError,
  PoolCreationError,
  TypeParserSetupError,
} from './errors'
import { ConnectionPool, ConnectionPoolConfig } from './types'

export const makeConnectionPool = (
  poolConfig: ConnectionPoolConfig
): TE.TaskEither<PoolCreationError | TypeParserSetupError, ConnectionPool> => {
  const { onError, parsers } = poolConfig

  const poolIO = IO.tryCatch(() => {
    const pool = new pg.Pool(poolConfig)

    pool.on('error', flow(makeUnhandledPoolError, onError))

    return pool
  }, makePoolCreationError)
}
