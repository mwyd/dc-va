import { Assistant } from "./assistant";
import { openai } from "../openai";

interface Config {
  model: string;
  role: "system" | "user" | "assistant";
}

export class OpenAiAssistant implements Assistant {
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
