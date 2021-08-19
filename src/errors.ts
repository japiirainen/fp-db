import * as t from 'io-ts'
import { QueryConfig } from 'pg'

export class PoolCheckoutError extends Error {
  public readonly _PoolCheckoutError: void

  constructor(public readonly error: t.mixed) {
    super('unable to checkout a connection from the pool.')

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PoolCheckoutError)
    }

    this.name = this.constructor.name
  }
}

export const makePoolCheckoutError = (error: t.mixed): PoolCheckoutError =>
  new PoolCheckoutError(error)
export const isPoolCheckoutError = (error: Error): error is PoolCheckoutError =>
  error instanceof PoolCheckoutError

export class PoolCreationError extends Error {
  public readonly _PoolCreationError: void

  constructor(public readonly error: t.mixed) {
    super('Unable to create a connection pool.')

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PoolCreationError)
    }

    this.name = this.constructor.name
  }
}

export const makePoolCreationError = (error: t.mixed): PoolCreationError =>
  new PoolCreationError(error)
export const isPoolCreationError = (error: Error): error is PoolCreationError =>
  error instanceof PoolCreationError

export class PoolShutdownError extends Error {
  public readonly _PoolShutdownError: void

  constructor(public readonly error: t.mixed) {
    super('Unable to shutdown a connection pool.')

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PoolShutdownError)
    }

    this.name = this.constructor.name
  }
}

export const makePoolShutdownError = (e: t.mixed): PoolShutdownError =>
  new PoolShutdownError(e)

export const isPoolShutdownError = (e: Error): e is PoolShutdownError =>
  e instanceof PoolShutdownError

export class DriverQueryError extends Error {
  public readonly _DriverQueryError: void

  constructor(
    public readonly error: t.mixed,
    public readonly query: QueryConfig,
    public readonly context: t.mixed
  ) {
    super(
      error instanceof Error
        ? error.message
        : 'Error raised by node-pg during query execution.'
    )

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DriverQueryError)
    }

    this.name = this.constructor.name
  }
}

export const makeDriverQueryError =
  (query: QueryConfig, context: t.mixed) =>
  (e: t.mixed): DriverQueryError =>
    new DriverQueryError(e, query, context)
export const isDriverQueryError = (e: Error): e is DriverQueryError =>
  e instanceof DriverQueryError

export class RowValidationError extends Error {
  public readonly _RowValidationError: void

  constructor(
    public readonly type: t.Any,
    public readonly value: t.mixed,
    public readonly errors: t.Errors,
    public readonly context: t.mixed
  ) {
    super('Validation of a result row failed.')

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RowValidationError)
    }

    this.name = this.constructor.name
  }
}

export const makeRowValidationError =
  (type: t.Any, value: t.mixed, context: t.mixed) =>
  (errors: t.Errors): RowValidationError =>
    new RowValidationError(type, value, errors, context)
export const isRowValidationError = (e: Error): e is RowValidationError =>
  e instanceof RowValidationError

export class TypeParserSetupError extends Error {
  public readonly _TypeParserSetupError: void

  constructor(public readonly error: t.mixed) {
    super('Type parser setup failed.')

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TypeParserSetupError)
    }

    this.name = this.constructor.name
  }
}

export const makeTypeParserSetupError = (e: t.mixed): TypeParserSetupError =>
  new TypeParserSetupError(e)
export const isTypeParserSetupError = (e: Error): e is TypeParserSetupError =>
  e instanceof TypeParserSetupError

export class TransactionRollbackError extends Error {
  public readonly _TransactionRollbackError: void

  constructor(
    public readonly rollbackError: t.mixed,
    public readonly connectionError: t.mixed,
    public readonly context: t.mixed
  ) {
    super('A ROLLBACK was requested but not successfully completed.')

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TransactionRollbackError)
    }

    this.name = this.constructor.name
  }
}

export const makeTransactionRollbackError = (
  rollbackError: t.mixed,
  connectionError: t.mixed,
  context: t.mixed
): TransactionRollbackError =>
  new TransactionRollbackError(rollbackError, connectionError, context)
export const isTransactionRollbackError = (
  e: Error
): e is TransactionRollbackError => e instanceof TransactionRollbackError

export class UnhandledConnectionError extends Error {
  public readonly _UnhandledConnectionError: void

  constructor(public readonly error: t.mixed) {
    super('An unhandled error was raised by a connection.')

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnhandledConnectionError)
    }

    this.name = this.constructor.name
  }
}

export const makeUnhandledConnectionError = (
  e: t.mixed
): UnhandledConnectionError => new UnhandledConnectionError(e)
export const isUnhandledConnectionError = (
  e: Error
): e is UnhandledConnectionError => e instanceof UnhandledConnectionError

export class UnhandledPoolError extends Error {
  public readonly _UnhandledPoolError: void

  constructor(public readonly error: t.mixed) {
    super('An unhandled error was raised by a connection pool.')

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnhandledPoolError)
    }

    this.name = this.constructor.name
  }
}

export const makeUnhandledPoolError = (e: t.mixed): UnhandledPoolError =>
  new UnhandledPoolError(e)
export const isUnhandledPoolError = (e: Error): e is UnhandledPoolError =>
  e instanceof UnhandledPoolError
