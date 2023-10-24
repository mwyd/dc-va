import { Command } from "../command";
import {
  CommandInteraction,
  Interaction,
  SlashCommandBuilder,
} from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";
import { logger } from "../../config";
import { actionManager } from "./actions";

enum State {
  Connected = "connected",
  Disconnected = "disconnected",
}

class AssistCommand extends Command {
  private state: State = State.Disconnected;

  constructor() {
    const builder = new SlashCommandBuilder()
      .setName("assist")
      .setDescription("Evokes virtual assistant");

    super(builder);
  }

  public async execute(interaction: CommandInteraction): Promise<void> {
    if (this.state === State.Connected) {
      await interaction.reply({
        content: "There is another instance running",
        ephemeral: true,
      });

      return;
    }

    const { user, client, guild } = interaction;

    const channel = guild?.members.cache.get(user.id)?.voice.channel;

    if (!channel) {
      await interaction.reply({
        content: "You have to be connected to voice channel",
        ephemeral: true,
      });

      return;
    }

    const voiceConnection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    this.setState(State.Connected);

    const reply = await interaction.reply({
      components: [actionManager.rowComponent],
    });

    const listener = async (interaction: Interaction) => {
      if (!interaction.isButton()) {
        return;
      }

      const action = actionManager.get(interaction.customId);

      if (!action) {
        logger.warn(`Action '${interaction.customId}' not found`);

        return;
      }

      try {
        await action.execute(interaction);
      } catch (err) {
        logger.error(
          `Error when executing action '${interaction.customId}' - ${err}`,
        );
      }
    };

    client.on("interactionCreate", listener);

    voiceConnection.on("stateChange", (oldState, newState) => {
      if (
        newState.status === "destroyed" ||
        newState.status === "disconnected"
      ) {
        client.removeListener("interactionCreate", listener);

        reply.delete();

        this.setState(State.Disconnected);

        actionManager.clear();
      }
    });
  }

  private setState(state: State): void {
    this.state = state;

    logger.info(`Assist command state changed to '${state}'`);
  }
}

export default new AssistCommand();
