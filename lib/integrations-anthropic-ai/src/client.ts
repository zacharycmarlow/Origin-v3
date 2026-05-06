import Anthropic from "@anthropic-ai/sdk";

// Lazy singleton — does NOT throw at module load time.
// Throws only when getAnthropic() is first called inside a route handler.
let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (_client) return _client;

  if (!process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL) {
    throw new Error(
      "AI_INTEGRATIONS_ANTHROPIC_BASE_URL must be set. Did you forget to provision the Anthropic AI integration?",
    );
  }
  if (!process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY) {
    throw new Error(
      "AI_INTEGRATIONS_ANTHROPIC_API_KEY must be set. Did you forget to provision the Anthropic AI integration?",
    );
  }

  _client = new Anthropic({
    apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
  });
  return _client;
}

// Convenience proxy so existing `anthropic.messages.create(...)` call sites
// keep working without change — property access triggers lazy init at call time.
export const anthropic: Anthropic = new Proxy({} as Anthropic, {
  get(_target, prop: string | symbol) {
    return (getAnthropic() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
