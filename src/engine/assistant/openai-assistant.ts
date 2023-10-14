import { Assistant } from "./assistant";
import { openai } from "../../openai";
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions";

interface Config {
  model: ChatCompletionCreateParamsBase["model"];
  role: "system" | "user" | "assistant";
}

export class OpenAIAssistant implements Assistant {
  constructor(private readonly config: Config) {}

  public async chat(message: string): Promise<string> {
    const { model, role } = this.config;

    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role, content: message }],
      model,
    });

    return chatCompletion.choices.map((c) => c.message.content).join("\n");
  }
}
