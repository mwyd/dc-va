import { ButtonAction } from "./button-action";
import { ActionRowBuilder, ButtonBuilder } from "discord.js";
import { AskAction } from "./ask-action";
import { CancelAction } from "./cancel-action";

function getButtonActions(): ButtonAction[] {
  return [new AskAction(), new CancelAction()];
}

export class ActionManager {
  private actions: Map<string, ButtonAction> = new Map();
  private row: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder();

  constructor() {
    this.initialize();
  }

  public get rowComponent(): ActionRowBuilder<ButtonBuilder> {
    return this.row;
  }

  public get(id: string): ButtonAction | undefined {
    return this.actions.get(id);
  }

  public clear(): void {
    this.actions = new Map();
    this.row = new ActionRowBuilder<ButtonBuilder>();

    this.initialize();
  }

  private initialize(): void {
    const buttonActions = getButtonActions();

    for (const buttonAction of buttonActions) {
      this.actions.set(buttonAction.id, buttonAction);
      this.row.addComponents(buttonAction.button);
    }
  }
}
