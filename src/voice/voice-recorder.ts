import { AudioReceiveStream } from "@discordjs/voice";
import fs from "fs";
import { OpusEncoder } from "@discordjs/opus";
import { v4 as uuidv4 } from "uuid";
import { spawn } from "child_process";

interface Config {
  outDir: string;
  rate: number;
  channels: number;
}

export class VoiceRecorder {
  private readonly encoder: OpusEncoder;

  constructor(private readonly config: Config) {
    this.encoder = new OpusEncoder(config.rate, config.channels);
  }

  public async record(opusStream: AudioReceiveStream): Promise<string> {
    const rawFile = await this.saveRaw(opusStream);
    const convertedFile = await this.convert(rawFile);

    fs.unlinkSync(rawFile);

    return convertedFile;
  }

  private saveRaw(opusStream: AudioReceiveStream): Promise<string> {
    const { outDir } = this.config;

    const file = `${outDir}/${uuidv4()}.pcm`;

    return new Promise((resolve, reject) => {
      const outputStream = fs.createWriteStream(file);

      opusStream.on("error", (err) => {
        reject(err.message);
      });

      opusStream.on("data", (packet) => {
        outputStream.write(this.encoder.decode(packet));
      });

      opusStream.on("close", () => {
        outputStream.destroy();

        const { readableEnded } = opusStream;

        if (readableEnded) {
          resolve(file);

          return;
        }

        fs.unlinkSync(file);

        reject("stream closed before readable ended");
      });
    });
  }

  private convert(file: string): Promise<string> {
    const { outDir, rate, channels } = this.config;

    const convertedFile = `${outDir}/${uuidv4()}.mp3`;

    const args = [
      "-f",
      "s16le",
      "-ar",
      rate / 1000 + "k",
      "-ac",
      channels.toString(),
      "-i",
      file,
      convertedFile,
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
          resolve(file);
        }
      });
    });
  }
}
