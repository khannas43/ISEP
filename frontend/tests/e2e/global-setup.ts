/**
 * Playwright global setup: fail fast if the app is not reachable at baseURL.
 * Prevents 404/timeout confusion. Start the app with: cd frontend && npm run dev
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const timeoutMs = 8000;

async function globalSetup() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(baseURL, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.status === 404) {
      throw new Error(
        `App at ${baseURL} returned 404. Start the app with: cd frontend && npm run dev`
      );
    }
    if (res.status >= 500) {
      console.warn(
        `[global-setup] App at ${baseURL} returned ${res.status}. Proceeding; tests may skip or fail. Check server logs and Keycloak.`
      );
    }
  } catch (e) {
    clearTimeout(timeout);
    if (e instanceof Error && e.message.includes('Start the app with')) throw e;
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error(
        `App at ${baseURL} did not respond in ${timeoutMs}ms. Start the app with: cd frontend && npm run dev`
      );
    }
    throw new Error(
      `Cannot reach ${baseURL}. Start the app with: cd frontend && npm run dev`
    );
  }
}

export default globalSetup;
