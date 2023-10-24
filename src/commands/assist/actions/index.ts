import ActionManager from "./action-manager";
import { getVoiceConnection, VoiceConnection } from "@discordjs/voice";
import { ButtonInteraction } from "discord.js";
import { logger } from "../../../config";

export const actionManager = new ActionManager();

export default async function accessVoiceConnection(
  interaction: ButtonInteraction,
): Promise<VoiceConnection | undefined> {
  const { guild, user } = interaction;

  if (!guild) {
    await interaction.reply({
      content: "Internal error",
      ephemeral: true,
    });

    logger.error("Internal error - no guild id defined");

    return;
  }

  const voiceConnection = getVoiceConnection(guild.id);

  if (!voiceConnection) {
    await interaction.reply({
      content: "There is no active bot connection",
      ephemeral: true,
    });

    logger.error("Ask action - missing voice connection");

    return;
  }

  const userChannelId = guild.members.cache.get(user.id)?.voice.channel?.id;

  if (voiceConnection.joinConfig.channelId !== userChannelId) {
    await interaction.reply({
      content: "You have to be on channel to mange bot",
      ephemeral: true,
    });

    return;
  }

  return voiceConnection;
}
