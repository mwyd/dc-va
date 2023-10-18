import { AudioReceiveStream } from "@discordjs/voice";
import fs from "fs";
import { OpusEncoder } from "@discordjs/opus";
import { v4 as uuidv4 } from "uuid";
import { ffmpeg } from "../config";

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
    const { outDir, rate, channels } = this.config;

    const rawFile = await this.save(opusStream);

    const convertedFile = await ffmpeg.convert({
      format: "s16le",
      rate,
      channels,
      input: rawFile,
      output: `${outDir}/${uuidv4()}.mp3`,
    });

    fs.unlinkSync(rawFile);

    return convertedFile;
  }

  private save(opusStream: AudioReceiveStream): Promise<string> {
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
}
