/**
 * Host half of the Git sidebar tab.
 *
 * Serves one authenticated `/api` route to its own Client half. The browser
 * asks for a snapshot of the session directory; this half answers with the
 * repository root, working-tree changes and a bounded commit list.
 *
 * The route is a Connection exact Fetch route: the browser cookie is admitted
 * by the Connection service before this handler runs, and only the owner peer
 * may read it.
 */
import {
  commitChanges,
  commitDetail,
  createBranch,
  discardChanges,
  fileDiff,
  listBranches,
  revealInFileManager,
  snapshot,
  stageAll,
  stageFile,
  switchBranch,
  syncRepo,
  unstageAll,
  unstageFile,
} from './git.js'

/** Host services this plugin cannot work without. */
export const inject = ['connection']

/** The authenticated exact routes the panel reads. */
const SNAPSHOT_ROUTE = '/api/git-panel/snapshot'
const COMMIT_ROUTE = '/api/git-panel/commit'
const DIFF_ROUTE = '/api/git-panel/diff'
const STAGE_ROUTE = '/api/git-panel/stage'
const UNSTAGE_ROUTE = '/api/git-panel/unstage'
const COMMIT_CREATE_ROUTE = '/api/git-panel/commit-create'
const DISCARD_ROUTE = '/api/git-panel/discard'
const REVEAL_ROUTE = '/api/git-panel/reveal'
const BRANCHES_ROUTE = '/api/git-panel/branches'
const BRANCH_ROUTE = '/api/git-panel/branch'
const SYNC_ROUTE = '/api/git-panel/sync'

/** Serialize index mutations so two clicks cannot race git's index lock. */
let writeChain = Promise.resolve()

/**
 * Run one mutation after the previous one settled.
 * @param {() => Promise<unknown>} operation - mutation to run.
 * @returns {Promise<unknown>} the operation result.
 */
function serializeWrite(operation) {
  const run = writeChain.then(operation, operation)
  writeChain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}
/** Commit hashes accepted from the browser. */
const HASH_PATTERN = /^[0-9a-f]{4,64}$/i
/** Default and maximum commits returned to the panel. */
const DEFAULT_LIMIT = 60
const MAX_LIMIT = 1000

/**
 * One JSON response with the panel's no-store policy.
 * @param {object} body - JSON body.
 * @param {number} [status] - HTTP status.
 * @returns {Response} the response.
 */
function json(body, status = 200) {
  return Response.json(body, { status, headers: { 'cache-control': 'no-store' } })
}

/**
 * Clamp the requested commit count.
 * @param {unknown} value - payload field.
 * @returns {number} a whole number inside the supported range.
 */
function limitOf(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return DEFAULT_LIMIT
  return Math.min(MAX_LIMIT, Math.max(1, Math.floor(number)))
}

/**
 * Register the snapshot route; the registration belongs to this plugin context
 * and disappears with it.
 * @param {import('@deepseek-ai/cordis').Context} ctx - the plugin context.
 */
export function apply(ctx) {
  ctx.effect(
    () =>
      ctx.connection.fetch.register({
        path: SNAPSHOT_ROUTE,
        methods: ['POST'],
        requestBody: 'buffered',
        fetch: async (request) => {
          let body
          try {
            body = await request.json()
          } catch {
            return json({ error: 'body must be JSON' }, 400)
          }
          const cwd = body !== null && typeof body === 'object' && typeof body.cwd === 'string' ? body.cwd : ''
          if (cwd === '') return json({ error: 'cwd is required' }, 400)
          const sessionCwd =
            body !== null && typeof body === 'object' && typeof body.sessionCwd === 'string' && body.sessionCwd !== ''
              ? body.sessionCwd
              : undefined
          try {
            return json(await snapshot(cwd, limitOf(body.limit), request.signal, sessionCwd))
          } catch (error) {
            if (request.signal?.aborted) return new Response(null, { status: 499 })
            return json({ error: error instanceof Error ? error.message : String(error) }, 500)
          }
        },
      }),
    'git-panel: snapshot route',
  )
  ctx.effect(
    () =>
      ctx.connection.fetch.register({
        path: COMMIT_ROUTE,
        methods: ['POST'],
        requestBody: 'buffered',
        fetch: async (request) => {
          let body
          try {
            body = await request.json()
          } catch {
            return json({ error: 'body must be JSON' }, 400)
          }
          const cwd = body !== null && typeof body === 'object' && typeof body.cwd === 'string' ? body.cwd : ''
          const hash = body !== null && typeof body === 'object' && typeof body.hash === 'string' ? body.hash : ''
          if (cwd === '') return json({ error: 'cwd is required' }, 400)
          if (!HASH_PATTERN.test(hash)) return json({ error: 'hash is invalid' }, 400)
          const sessionCwd =
            body !== null && typeof body === 'object' && typeof body.sessionCwd === 'string' && body.sessionCwd !== ''
              ? body.sessionCwd
              : undefined
          try {
            return json(await commitDetail(cwd, hash, request.signal, sessionCwd))
          } catch (error) {
            if (request.signal?.aborted) return new Response(null, { status: 499 })
            return json({ error: error instanceof Error ? error.message : String(error) }, 500)
          }
        },
      }),
    'git-panel: commit route',
  )
  ctx.effect(
    () =>
      ctx.connection.fetch.register({
        path: DIFF_ROUTE,
        methods: ['POST'],
        requestBody: 'buffered',
        fetch: async (request) => {
          let body
          try {
            body = await request.json()
          } catch {
            return json({ error: 'body must be JSON' }, 400)
          }
          const cwd = body !== null && typeof body === 'object' && typeof body.cwd === 'string' ? body.cwd : ''
          if (cwd === '') return json({ error: 'cwd is required' }, 400)
          try {
            return json(
              await fileDiff(cwd, body, request.signal),
            )
          } catch (error) {
            if (request.signal?.aborted) return new Response(null, { status: 499 })
            return json({ error: error instanceof Error ? error.message : String(error) }, 500)
          }
        },
      }),
    'git-panel: diff route',
  )
  ctx.effect(
    () =>
      ctx.connection.fetch.register({
        path: STAGE_ROUTE,
        methods: ['POST'],
        requestBody: 'buffered',
        fetch: async (request) => {
          let body
          try {
            body = await request.json()
          } catch {
            return json({ error: 'body must be JSON' }, 400)
          }
          const cwd = body !== null && typeof body === 'object' && typeof body.cwd === 'string' ? body.cwd : ''
          if (cwd === '') return json({ error: 'cwd is required' }, 400)
          const target = body !== null && typeof body === 'object' ? body.path : undefined
          try {
            const result =
              target === undefined || target === null
                ? await serializeWrite(() => stageAll(cwd, request.signal))
                : await serializeWrite(() => stageFile(cwd, target, request.signal))
            return json(result)
          } catch (error) {
            if (request.signal?.aborted) return new Response(null, { status: 499 })
            return json({ error: error instanceof Error ? error.message : String(error) }, 500)
          }
        },
      }),
    'git-panel: stage route',
  )
  ctx.effect(
    () =>
      ctx.connection.fetch.register({
        path: UNSTAGE_ROUTE,
        methods: ['POST'],
        requestBody: 'buffered',
        fetch: async (request) => {
          let body
          try {
            body = await request.json()
          } catch {
            return json({ error: 'body must be JSON' }, 400)
          }
          const cwd = body !== null && typeof body === 'object' && typeof body.cwd === 'string' ? body.cwd : ''
          if (cwd === '') return json({ error: 'cwd is required' }, 400)
          const target = body !== null && typeof body === 'object' ? body.path : undefined
          try {
            const result =
              target === undefined || target === null
                ? await serializeWrite(() => unstageAll(cwd, request.signal))
                : await serializeWrite(() => unstageFile(cwd, target, request.signal))
            return json(result)
          } catch (error) {
            if (request.signal?.aborted) return new Response(null, { status: 499 })
            return json({ error: error instanceof Error ? error.message : String(error) }, 500)
          }
        },
      }),
    'git-panel: unstage route',
  )
  ctx.effect(
    () =>
      ctx.connection.fetch.register({
        path: COMMIT_CREATE_ROUTE,
        methods: ['POST'],
        requestBody: 'buffered',
        fetch: async (request) => {
          let body
          try {
            body = await request.json()
          } catch {
            return json({ error: 'body must be JSON' }, 400)
          }
          const cwd = body !== null && typeof body === 'object' && typeof body.cwd === 'string' ? body.cwd : ''
          if (cwd === '') return json({ error: 'cwd is required' }, 400)
          const message = body !== null && typeof body === 'object' && typeof body.message === 'string' ? body.message : ''
          try {
            const result = await serializeWrite(() => commitChanges(cwd, message, request.signal))
            return json(result)
          } catch (error) {
            if (request.signal?.aborted) return new Response(null, { status: 499 })
            return json({ error: error instanceof Error ? error.message : String(error) }, 500)
          }
        },
      }),
    'git-panel: commit-create route',
  )
  ctx.effect(
    () =>
      ctx.connection.fetch.register({
        path: DISCARD_ROUTE,
        methods: ['POST'],
        requestBody: 'buffered',
        fetch: async (request) => {
          let body
          try {
            body = await request.json()
          } catch {
            return json({ error: 'body must be JSON' }, 400)
          }
          const cwd = body !== null && typeof body === 'object' && typeof body.cwd === 'string' ? body.cwd : ''
          const target = body !== null && typeof body === 'object' && typeof body.path === 'string' ? body.path : ''
          if (cwd === '') return json({ error: 'cwd is required' }, 400)
          if (target === '') return json({ error: 'path is required' }, 400)
          const origPath =
            body !== null && typeof body === 'object' && typeof body.origPath === 'string' ? body.origPath : null
          try {
            const result = await serializeWrite(() => discardChanges(cwd, target, origPath, request.signal))
            return json(result)
          } catch (error) {
            if (request.signal?.aborted) return new Response(null, { status: 499 })
            return json({ error: error instanceof Error ? error.message : String(error) }, 500)
          }
        },
      }),
    'git-panel: discard route',
  )
  ctx.effect(
    () =>
      ctx.connection.fetch.register({
        path: REVEAL_ROUTE,
        methods: ['POST'],
        requestBody: 'buffered',
        fetch: async (request) => {
          let body
          try {
            body = await request.json()
          } catch {
            return json({ error: 'body must be JSON' }, 400)
          }
          const cwd = body !== null && typeof body === 'object' && typeof body.cwd === 'string' ? body.cwd : ''
          const target = body !== null && typeof body === 'object' && typeof body.path === 'string' ? body.path : ''
          if (cwd === '') return json({ error: 'cwd is required' }, 400)
          if (target === '') return json({ error: 'path is required' }, 400)
          try {
            return json(await revealInFileManager(cwd, target, request.signal))
          } catch (error) {
            if (request.signal?.aborted) return new Response(null, { status: 499 })
            return json({ error: error instanceof Error ? error.message : String(error) }, 500)
          }
        },
      }),
    'git-panel: reveal route',
  )
  ctx.effect(
    () =>
      ctx.connection.fetch.register({
        path: BRANCHES_ROUTE,
        methods: ['POST'],
        requestBody: 'buffered',
        fetch: async (request) => {
          let body
          try {
            body = await request.json()
          } catch {
            return json({ error: 'body must be JSON' }, 400)
          }
          const cwd = body !== null && typeof body === 'object' && typeof body.cwd === 'string' ? body.cwd : ''
          if (cwd === '') return json({ error: 'cwd is required' }, 400)
          try {
            return json(await listBranches(cwd, request.signal))
          } catch (error) {
            if (request.signal?.aborted) return new Response(null, { status: 499 })
            return json({ error: error instanceof Error ? error.message : String(error) }, 500)
          }
        },
      }),
    'git-panel: branches route',
  )
  ctx.effect(
    () =>
      ctx.connection.fetch.register({
        path: BRANCH_ROUTE,
        methods: ['POST'],
        requestBody: 'buffered',
        fetch: async (request) => {
          let body
          try {
            body = await request.json()
          } catch {
            return json({ error: 'body must be JSON' }, 400)
          }
          const cwd = body !== null && typeof body === 'object' && typeof body.cwd === 'string' ? body.cwd : ''
          const name = body !== null && typeof body === 'object' && typeof body.name === 'string' ? body.name : ''
          if (cwd === '') return json({ error: 'cwd is required' }, 400)
          if (name === '') return json({ error: 'name is required' }, 400)
          const create = body !== null && typeof body === 'object' && body.create === true
          try {
            const result = await serializeWrite(() =>
              create ? createBranch(cwd, name, request.signal) : switchBranch(cwd, name, request.signal),
            )
            return json(result)
          } catch (error) {
            if (request.signal?.aborted) return new Response(null, { status: 499 })
            return json({ error: error instanceof Error ? error.message : String(error) }, 500)
          }
        },
      }),
    'git-panel: branch route',
  )
  ctx.effect(
    () =>
      ctx.connection.fetch.register({
        path: SYNC_ROUTE,
        methods: ['POST'],
        requestBody: 'buffered',
        fetch: async (request) => {
          let body
          try {
            body = await request.json()
          } catch {
            return json({ error: 'body must be JSON' }, 400)
          }
          const cwd = body !== null && typeof body === 'object' && typeof body.cwd === 'string' ? body.cwd : ''
          const action = body !== null && typeof body === 'object' && typeof body.action === 'string' ? body.action : ''
          if (cwd === '') return json({ error: 'cwd is required' }, 400)
          if (action !== 'fetch' && action !== 'pull' && action !== 'push') {
            return json({ error: 'unknown sync action' }, 400)
          }
          try {
            const result = await serializeWrite(() => syncRepo(cwd, action, request.signal))
            return json(result)
          } catch (error) {
            if (request.signal?.aborted) return new Response(null, { status: 499 })
            return json({ error: error instanceof Error ? error.message : String(error) }, 500)
          }
        },
      }),
    'git-panel: sync route',
  )
}