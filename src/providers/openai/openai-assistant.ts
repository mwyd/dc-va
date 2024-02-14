import { Assistant } from "../../engine/assistant";
import { openai } from "./index";
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions";

interface Config {
  model: ChatCompletionCreateParamsBase["model"];
  role: "system" | "user" | "assistant";
  minChunkLength: number;
  stopCharacters: string[];
}

export class OpenAIAssistant implements Assistant {
  constructor(private readonly config: Config) {}

  public async *chat(message: string): AsyncGenerator<string> {
    const { model, role, minChunkLength, stopCharacters } = this.config;

    const stream = await openai.chat.completions.create({
      model,
      messages: [{ role, content: message }],
      stream: true,
    });

    let chunk = "";

    for await (const part of stream) {
      const content = part.choices[0]?.delta.content || "";

      chunk += content;

      if (chunk.length > minChunkLength && stopCharacters.includes(content)) {
        yield chunk.trim();

        chunk = "";
      }
    }

    chunk = chunk.trim();

    if (chunk.length > 0) {
      yield chunk;
    }
  }
}
