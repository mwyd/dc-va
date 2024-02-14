import { TextToSpeechConverter } from "./tts-converter";
import { openai } from "../../openai";
import { SpeechCreateParams } from "openai/resources/audio";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

interface Config {
  model: SpeechCreateParams["model"];
  voice: SpeechCreateParams["voice"];
  outDir: string;
}

export class OpenaiTTSConverter implements TextToSpeechConverter {
  constructor(private readonly config: Config) {}

  async convert(text: string): Promise<string> {
    const { model, voice, outDir } = this.config;

    const response = await openai.audio.speech.create({
      model,
      voice,
      input: text,
      response_format: "mp3",
    });

    const buffer = await response.arrayBuffer();

    const file = `${outDir}/${uuidv4()}.mp3`;

    fs.writeFileSync(file, Buffer.from(buffer));

    return file;
  }
}
