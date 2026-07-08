import path from 'path'

// Path constants shared between the globalSetup (auth.ts) and the test files.
// Kept in a separate module so that core-loop.spec.ts can import the paths
// WITHOUT importing auth.ts — which is a globalSetup entry point and must not
// be loaded as a regular module (Playwright throws "did not expect test() to
// be called here" when a setup file is imported by a spec).
const AUTH_DIR = path.join(__dirname, '..', '.auth')
const ADMIN_STATE = path.join(AUTH_DIR, 'admin.json')

export { AUTH_DIR, ADMIN_STATE }
