import { Engine } from "../engine";
import { GTTSConverter } from "../engine/tts/gtts-converter";
import { OpenAISTTConverter } from "../engine/stt/openai-stt-converter";
import { OpenAIAssistant } from "../engine/assistant/openai-assistant";
import { VoiceRecorder } from "../voice/voice-recorder";
import { FFmpeg } from "../audio/ffmpeg";
import { CommandManager } from "../commands/command-manager";
import path from "path";
import { REST } from "discord.js";
import winston from "winston";

export const engine = new Engine(
  new GTTSConverter({ outDir: "var", lang: "pl" }),
  new OpenAISTTConverter({ model: "whisper-1", lang: "pl" }),
  new OpenAIAssistant({ model: "gpt-3.5-turbo", role: "user" }),
);

export const voiceRecorder = new VoiceRecorder({
  outDir: "var",
  rate: 48000,
  channels: 2,
});

export const ffmpeg = new FFmpeg();

export const discordREST = new REST().setToken(process.env.DISCORD_TOKEN);

export const commandManager = new CommandManager({
  cacheDir: "var/cache",
  dir: path.join(__dirname, "../commands"),
  filter: (file) => file.endsWith("-command.js"),
});

export const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm" }),
        winston.format.printf(
          ({ timestamp, level, message }) =>
            `[${timestamp}] [${level.toUpperCase()}]: ${message}`,
        ),
      ),
    }),
  ],
});