import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_MODEL = "claude-sonnet-4-6";

export type LlmClient = {
  complete(system: string, user: string): Promise<string>;
};

/** Create an Anthropic client wrapper for text completions. */
export function createLlmClient(apiKey: string): LlmClient {
  const client = new Anthropic({ apiKey });

  return {
    async complete(system: string, user: string): Promise<string> {
      const response = await client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system,
        messages: [{ role: "user", content: user }],
      });

      const block = response.content[0];
      if (!block || block.type !== "text") {
        throw new Error("Unexpected LLM response format");
      }

      return block.text.trim();
    },
  };
}
