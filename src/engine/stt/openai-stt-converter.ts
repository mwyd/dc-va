import { SpeechToTextConverter } from "./stt-converter";
import { openai } from "../../openai";
import fs from "fs";
import { TranscriptionCreateParams } from "openai/resources/audio";

interface Config {
  model: TranscriptionCreateParams["model"];
  lang?: string;
}

export class OpenAISTTConverter implements SpeechToTextConverter {
  constructor(private readonly config: Config) {}

  public async convert(file: string): Promise<string> {
    const { model, lang } = this.config;

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(file),
      model: model,
      language: lang,
    });

    return transcription.text;
  }
}
