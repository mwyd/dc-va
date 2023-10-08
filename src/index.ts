import "./dotenv";

import { Client, GatewayIntentBits } from "discord.js";
import {
  EndBehaviorType,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import { Engine } from "./engine";
import { VoiceRecorder } from "./voice/voice-recorder";
import { GTTSConverter } from "./engine/tts/gtts-converter";
import { OpenAISTTConverter } from "./engine/stt/openai-stt-converter";
import { OpenAIAssistant } from "./engine/assistant/openai-assistant";

const engine = new Engine(
  new GTTSConverter({ outDir: "var", lang: "pl" }),
  new OpenAISTTConverter({ model: "whisper-1", lang: "pl" }),
  new OpenAIAssistant({ model: "gpt-3.5-turbo", role: "user" }),
);

console.log(engine);

const voiceRecorder = new VoiceRecorder({
  outDir: "var",
  rate: 48000,
  channels: 2,
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once("ready", (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (message.content !== "!join") {
    return;
  }

  const channel = message.member?.voice.channel;

  if (!channel) {
    return;
  }

  const voiceConnection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: false,
  });

  voiceConnection.receiver.speaking.on("start", (userId) => {
    if (userId !== message.author.id) {
      return;
    }

    console.log("Listening");

    const opusStream = voiceConnection.receiver.subscribe(userId, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: 300,
      },
    });

    voiceRecorder.record(opusStream).then(console.log);
  });
});

client.on("messageCreate", (message) => {
  if (message.content === "!leave") {
    const channel = message.member?.voice.channel;

    if (!channel) {
      return;
    }

    getVoiceConnection(channel.guild.id)?.destroy();
  }
});

client.login(process.env.DISCORD_TOKEN);
