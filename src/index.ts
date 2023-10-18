import "./dotenv";

import { Client, GatewayIntentBits } from "discord.js";
import { commandManager, logger } from "./config";

commandManager.load().then(() => commandManager.synchronize());

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once("ready", (c) => {
  logger.info(`Ready! Logged in as ${c.user.tag}`);
});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const command = commandManager.get(interaction.commandName);

  if (!command) {
    logger.warn(`Command '${interaction.commandName}' not found`);

    return;
  }

  command.execute(interaction);
});

client.login(process.env.DISCORD_TOKEN);
