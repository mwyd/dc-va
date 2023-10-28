import { ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js";
import {
  createAudioPlayer,
  createAudioResource,
  EndBehaviorType,
  VoiceConnection,
} from "@discordjs/voice";
import { ButtonAction } from "./button-action";
import {
  ASK_SILENCE_TIMEOUT,
  engine,
  logger,
  voiceRecorder,
} from "../../../config";
import accessVoiceConnection, { actionManager } from "./index";
import fs from "fs";

enum State {
  Idle = "idle",
  Listening = "listening",
  Processing = "processing",
  Finishing = "finishing",
}

export default class AskAction extends ButtonAction {
  private state: State = State.Idle;
  private ttsQueue: string[] = [];

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
        await this.handleSpeaking(voiceConnection, interaction);
      } catch (err) {
        logger.error(`Error while listening - ${err}`);
      }
    };

    const { speaking } = voiceConnection.receiver;

    speaking.on("start", listener);

    speaking.on("end", (userId) => {
      if (userId !== user.id || this.state !== State.Listening) {
        return;
      }

      this.button.setLabel("Processing");

      this.editReply(interaction);

      speaking.removeListener("start", listener);
    });
  }

  private async handleSpeaking(
    voiceConnection: VoiceConnection,
    interaction: ButtonInteraction,
  ): Promise<void> {
    this.setState(State.Listening);

    const { user } = interaction;

    const opusStream = voiceConnection.receiver.subscribe(user.id, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: ASK_SILENCE_TIMEOUT,
      },
    });

    const file = await voiceRecorder.record(opusStream);

    const player = createAudioPlayer();

    player.on("stateChange", (oldState, newState) => {
      if (
        (oldState.status == "playing" && newState.status == "idle") ||
        newState.status == "autopaused"
      ) {
        const tts = this.ttsQueue.shift();

        if (tts) {
          fs.unlinkSync(tts);
        }

        const nextTts = this.ttsQueue[0];

        if (nextTts) {
          player.play(createAudioResource(nextTts));

          return;
        }

        if (this.state !== State.Finishing) {
          return;
        }

        this.setState(State.Idle);

        this.button.setDisabled(false);
        this.button.setLabel("Ask");

        this.editReply(interaction);
      }
    });

    voiceConnection.subscribe(player);

    this.setState(State.Processing);

    for await (const tts of engine.process(file)) {
      this.ttsQueue.push(tts);

      if (this.ttsQueue.length > 1) {
        continue;
      }

      player.play(createAudioResource(tts));
    }

    fs.unlinkSync(file);

    this.setState(State.Finishing);
  }

  private async editReply(interaction: ButtonInteraction): Promise<void> {
    try {
      await interaction.editReply({ components: [actionManager.rowComponent] });
    } catch (err) {
      logger.warn(`Error while updating reply - ${err}`);
    }
  }

  private setState(state: State): void {
    this.state = state;

    logger.info(`Ask action state changed to '${state}'`);
  }
}
