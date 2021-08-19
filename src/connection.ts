import * as TE from 'fp-ts/lib/TaskEither'
import * as t from 'io-ts'
import * as pg from 'pg'
import { makeDriverQueryError } from './errors'
import { Connection } from './types'

export const wrapPoolClient = (poolClient: pg.PoolClient): Connection => ({
  query: (config: pg.QueryConfig, context: t.mixed) =>
    TE.tryCatch(
      () => poolClient.query(config),
      makeDriverQueryError(config, context)
    ),

  release: (error) => poolClient.release(error),
})
