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
import { commitDetail, fileDiff, snapshot } from './git.js'

/** Host services this plugin cannot work without. */
export const inject = ['connection']

/** The authenticated exact routes the panel reads. */
const SNAPSHOT_ROUTE = '/api/git-panel/snapshot'
const COMMIT_ROUTE = '/api/git-panel/commit'
const DIFF_ROUTE = '/api/git-panel/diff'
/** Commit hashes accepted from the browser. */
const HASH_PATTERN = /^[0-9a-f]{4,64}$/i
/** Default and maximum commits returned to the panel. */
const DEFAULT_LIMIT = 60
const MAX_LIMIT = 200

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
          try {
            return json(await snapshot(cwd, limitOf(body.limit), request.signal))
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
          try {
            return json(await commitDetail(cwd, hash, request.signal))
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
}