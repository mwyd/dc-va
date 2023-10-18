import { spawn } from "child_process";

interface Options {
  format: string;
  rate: number;
  channels: number;
  input: string;
  output: string;
}

export class FFmpeg {
  public convert(options: Options): Promise<string> {
    const { format, rate, channels, input, output } = options;

    const args = [
      "-f",
      format,
      "-ar",
      rate / 1000 + "k",
      "-ac",
      channels.toString(),
      "-i",
      input,
      output,
    ];

    return new Promise((resolve, reject) => {
      const process = spawn("ffmpeg", args);

      process.on("error", (err) => {
        reject(err.message);
      });

      process.on("close", (code) => {
        if (code !== 0) {
          reject(`ffmpeg failed with code: ${code}`);
        } else {
          resolve(output);
        }
      });
    });
  }
}
