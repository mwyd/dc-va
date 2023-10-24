import { ButtonBuilder, ButtonInteraction } from "discord.js";

export abstract class ButtonAction {
  protected constructor(private readonly builder: ButtonBuilder) {}

  public get button(): ButtonBuilder {
    return this.builder;
  }

  public abstract get id(): string;

  public abstract execute(interaction: ButtonInteraction): Promise<void>;
}
