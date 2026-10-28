const SAFE_MODEL_NAME = /^[A-Za-z0-9._-]+$/;

/**
 * Use a configured model id, or the provider default.
 * Rejects names that could change a URL or header when a provider interpolates them.
 */
export function resolveModelName(configured: string | undefined, fallback: string): string {
  const model = configured ?? fallback;

  if (!SAFE_MODEL_NAME.test(model)) {
    throw new Error('The model name contains characters that are not allowed.');
  }

  return model;
}
