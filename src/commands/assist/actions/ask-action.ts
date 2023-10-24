import { ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js";
import {
  createAudioPlayer,
  createAudioResource,
  EndBehaviorType,
  VoiceConnection,
} from "@discordjs/voice";
import { ButtonAction } from "./button-action";
import { engine, logger, voiceRecorder } from "../../../config";
import accessVoiceConnection, { actionManager } from "./index";
import fs from "fs";

enum State {
  Idle = "idle",
  Listening = "listening",
  Speaking = "speaking",
  Processing = "processing",
}

export default class AskAction extends ButtonAction {
  private state: State = State.Idle;

  constructor() {
    const button = new ButtonBuilder()
      .setCustomId("#ask")
      .setLabel("Ask")
      .setStyle(ButtonStyle.Primary);

    super(button);
  }

  public get id(): string {
    return "#ask";
  }

  public async execute(interaction: ButtonInteraction): Promise<void> {
    const voiceConnection = await accessVoiceConnection(interaction);

    if (!voiceConnection) {
      return;
    }

    this.button.setDisabled(true);
    this.button.setLabel("Listening");

    await interaction.update({ components: [actionManager.rowComponent] });

    const { user } = interaction;

    const listener = async (userId: string) => {
      if (userId !== user.id) {
        return;
      }

      try {
        await this.listen(voiceConnection, interaction);
      } catch (err) {
        logger.error(`Error when listening - ${err}`);
      }
    };

    const { speaking } = voiceConnection.receiver;

    speaking.on("start", listener);

    speaking.on("end", (userId) => {
      if (userId !== user.id || this.state !== State.Listening) {
        return;
      }

      this.button.setLabel("Processing");

      interaction.editReply({ components: [actionManager.rowComponent] });

      speaking.removeListener("start", listener);
    });
  }

  private async listen(
    voiceConnection: VoiceConnection,
    interaction: ButtonInteraction,
  ): Promise<void> {
    this.setState(State.Listening);

    const { user } = interaction;

    const opusStream = voiceConnection.receiver.subscribe(user.id, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: 500,
      },
    });

    const file = await voiceRecorder.record(opusStream);

    this.setState(State.Processing);

    const tts = await engine.process(file);

    this.setState(State.Speaking);

    const player = createAudioPlayer();
    const resource = createAudioResource(tts);

    voiceConnection.subscribe(player);

    player.play(resource);

    player.on("stateChange", (oldState, newState) => {
      if (
        (oldState.status == "playing" && newState.status == "idle") ||
        newState.status == "autopaused"
      ) {
        fs.unlinkSync(file);
        fs.unlinkSync(tts);

        this.setState(State.Idle);

        this.button.setDisabled(false);
        this.button.setLabel("Ask");

        interaction.editReply({ components: [actionManager.rowComponent] });
      }
    });
  }

  private setState(state: State): void {
    this.state = state;

    logger.info(`Ask action state changed to '${state}'`);
  }
}
