import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export abstract class Command {
  protected constructor(private readonly builder: SlashCommandBuilder) {}

  public get data(): SlashCommandBuilder {
    return this.builder;
  }

  public abstract execute(interaction: CommandInteraction): Promise<void>;
}
