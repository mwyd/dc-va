import { TextToSpeechConverter } from "./tts-converter";
import { spawn } from "child_process";
import { v4 as uuidv4 } from "uuid";

interface Config {
  outDir: string;
  lang: string;
}

export class GTTSConverter implements TextToSpeechConverter {
  constructor(private readonly config: Config) {}

  public convert(text: string): Promise<string> {
    const { outDir, lang } = this.config;

    const file = `${outDir}/${uuidv4()}.mp3`;

    const args = [`'${text}'`, "-o", file, "-l", lang];

    return new Promise((resolve, reject) => {
      const process = spawn("gtts-cli", args);

      process.on("close", (code) => {
        if (code !== 0) {
          reject(`Command failed with code: ${code}`);
        } else {
          resolve(file);
        }
      });
    });
  }
}
