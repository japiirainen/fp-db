import * as RTE from 'fp-ts/lib/ReaderTaskEither'
import * as TE from 'fp-ts/lib/TaskEither'
import * as t from 'io-ts'
import * as O from 'optics-ts'
import * as pg from 'pg'
import {
  DriverQueryError,
  PoolCheckoutError,
  PoolShutdownError,
  TransactionRollbackError,
  UnhandledConnectionError,
  UnhandledPoolError,
} from './errors'

export interface Connection {
  query(
    config: pg.QueryConfig,
    context: t.mixed
  ): TE.TaskEither<DriverQueryError, QueryResult>
  release(err?: Error): void
}

export const ConnectionSymbol = Symbol('fp-db connection')
export type ConnectionSymbol = typeof ConnectionSymbol

export interface ConnectionEnvironment {
  [ConnectionSymbol]: Connection
}

export type ConnectionError<T> =
  | PoolCheckoutError
  | UnhandledConnectionError
  | T

export interface ConnectionPool {
  end(): TE.TaskEither<PoolShutdownError, void>

  withConnection<L, A>(
    program: RTE.ReaderTaskEither<ConnectionEnvironment, L, A>
  ): TE.TaskEither<ConnectionError<L>, A>

  withConnectionE<E extends Record<string, unknown>, L, A>(
    program: RTE.ReaderTaskEither<ConnectionEnvironment & E, L, A>
  ): RTE.ReaderTaskEither<E, ConnectionError<L>, A>
}

export interface ConnectionPoolConfig extends pg.PoolConfig {
  onError: (error: UnhandledPoolError) => void
  parsers: TypeParsers
}

export interface QueryResult extends pg.QueryResult {
  rows: t.mixed[]
}

export type RowTransformer = (x: t.mixed[]) => t.mixed[]

export type TransactionError<T> =
  | DriverQueryError
  | TransactionRollbackError
  | UnhandledConnectionError
  | T

export type TransactionIsolationLevel =
  | 'READ UNCOMMITTED'
  | 'READ COMMITTED'
  | 'REPEATABLE READ'
  | 'SERIALIZABLE'

export interface TransactionOptions {
  readonly context: t.mixed
  readonly deferrable: boolean
  readonly isolation: TransactionIsolationLevel
  readonly readOnly: boolean
}

export type TypeParser<T> = (val: string) => T
export type TypeParsers = Record<string, TypeParser<any>>

export const connectionL =
  O.optic<ConnectionEnvironment>().prop(ConnectionSymbol)
