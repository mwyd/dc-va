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

  public record(audioStream: AudioReceiveStream): Promise<string> {
    const { outDir, rate, channels } = this.config;

    const id = uuidv4();

    const pcmFile = `${outDir}/${id}.pcm`;
    const convertedFile = `${outDir}/${id}.mp3`;

    const outputStream = fs.createWriteStream(pcmFile);

    return new Promise((resolve, reject) => {
      audioStream.on("data", (packet) => {
        outputStream.write(this.encoder.decode(packet));
      });

      audioStream.on("end", () => {
        outputStream.destroy();

        const args = [
          "-f",
          "s16le",
          "-ar",
          rate / 1000 + "k",
          "-ac",
          channels.toString(),
          "-i",
          pcmFile,
          convertedFile,
        ];

        const cmd = spawn("ffmpeg", args);

        cmd.on("close", (code) => {
          if (code !== 0) {
            reject(`Command failed with code: ${code}`);
          } else {
            fs.unlinkSync(pcmFile);

            resolve(convertedFile);
          }
        });
      });

      audioStream.on("error", (err) => {
        reject(err.message);
      });
    });
  }
}
