import { Command } from "./command";
import {
  ActionRowBuilder,
  ButtonBuilder,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import {
  createAudioPlayer,
  createAudioResource,
  EndBehaviorType,
  joinVoiceChannel,
} from "@discordjs/voice";
import { engine, voiceRecorder } from "../config";

class AssistCommand extends Command {
  constructor() {
    const builder = new SlashCommandBuilder()
      .setName("assist")
      .setDescription("Evokes virtual assistant");

    super(builder);
  }

  public async execute(interaction: CommandInteraction): Promise<void> {
    // TODO: cleanup and separate logic into methods or services
    const channel = interaction.guild?.members.cache.get(interaction.user.id)
      ?.voice.channel;

    if (!channel) {
      return;
    }

    const voiceConnection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    const response = await interaction.reply({
      content: `Hello`,
      components: [this.createActionRow()],
    });

    voiceConnection.on("stateChange", (oldState, newState) => {
      if (newState.status === "destroyed") {
        response.delete();
      }
    });

    interaction.client.on("interactionCreate", (interaction) => {
      if (interaction.isButton()) {
        if (interaction.customId === "assistant-cancel") {
          voiceConnection.destroy();
        }
      }
    });
    let processing = false;

    voiceConnection.receiver.speaking.on("start", (userId) => {
      if (userId !== interaction.user.id || processing) {
        return;
      }

      processing = true;

      const opusStream = voiceConnection.receiver.subscribe(
        interaction.user.id,
        {
          end: {
            behavior: EndBehaviorType.AfterSilence,
            duration: 300,
          },
        },
      );

      voiceRecorder
        .record(opusStream)
        .then(async (file) => {
          console.log("Processing");

          const tts = await engine.process(file);

          console.log("Playing");

          const player = createAudioPlayer();
          const resource = createAudioResource(tts);

          voiceConnection.subscribe(player);

          player.play(resource);

          player.on("stateChange", (oldState, newState) => {
            console.log(newState.status, oldState.status);

            if (
              (oldState.status == "playing" && newState.status == "idle") ||
              newState.status == "autopaused"
            ) {
              processing = false;
            }
          });
        })
        .catch((err) => {
          processing = false;

          console.log(err);
        });
    });
  }

  private createActionRow(): ActionRowBuilder<ButtonBuilder> {
    const confirm = new ButtonBuilder()
      .setCustomId("assistant-ask")
      .setLabel("Ask")
      .setStyle(1);

    const cancel = new ButtonBuilder()
      .setCustomId("assistant-cancel")
      .setLabel("Cancel")
      .setStyle(4);

    return new ActionRowBuilder<ButtonBuilder>().setComponents(confirm, cancel);
  }
}

export default new AssistCommand();
