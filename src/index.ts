import "./dotenv";

import { Client, Events, GatewayIntentBits } from "discord.js";
import {
  EndBehaviorType,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";
import { OpusEncoder } from "@discordjs/opus";

const encoder = new OpusEncoder(48000, 2);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.MessageCreate, (message) => {
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

    opusStream.on("data", (packet) => {
      console.log(encoder.decode(packet));
    });

    opusStream.on("end", () => {
      console.log("Done");
    });
  });
});

client.on(Events.MessageCreate, (message) => {
  if (message.content === "!leave") {
    const channel = message.member?.voice.channel;

    if (!channel) {
      return;
    }

    getVoiceConnection(channel.guild.id)?.destroy();
  }
});

client.login(process.env.DISCORD_TOKEN);
