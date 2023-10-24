import { ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js";
import { ButtonAction } from "./button-action";
import accessVoiceConnection from "./index";

export default class CancelAction extends ButtonAction {
  constructor() {
    const button = new ButtonBuilder()
      .setCustomId("#cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Danger);

    super(button);
  }

  public get id(): string {
    return "#cancel";
  }

  public async execute(interaction: ButtonInteraction): Promise<void> {
    const voiceConnection = await accessVoiceConnection(interaction);

    voiceConnection?.destroy();
  }
}
