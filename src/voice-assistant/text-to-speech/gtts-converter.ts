import { TextToSpeechConverter } from "./tts-converter";
import { spawn } from "child_process";

export class GTTSConverter implements TextToSpeechConverter {
  convert(text: string): Promise<string> {
    // TODO output dir as a config variable
    // TODO unique filename (uuid)
    const file = 'var/test.mp3';

    return new Promise((resolve, reject) => {
      const cmd = spawn('gtts-cli', [`'${text}'`, '--output', file]);

      cmd.on('close', (code) => {
        if (code !== 0) {
          reject(`Command exited with code ${code}`);
        }

        resolve(file);
      });
    });
  }
}