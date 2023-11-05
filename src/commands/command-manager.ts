import { Collection, Routes } from "discord.js";
import { Command } from "./command";
import fs from "fs";
import path from "path";
import { discordREST, logger } from "../config";

interface Config {
  cacheDir: string;
  dir: string;
  filter: (file: string) => boolean;
}

export class CommandManager {
  private readonly commands: Collection<string, Command> = new Collection();

  constructor(private readonly config: Config) {}

  public get(name: string): Command | undefined {
    return this.commands.get(name);
  }

  public async load(): Promise<void> {
    const { dir, filter } = this.config;

    const folders = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const folder of folders) {
      const files = fs.readdirSync(path.join(dir, folder)).filter(filter);

      for (const file of files) {
        const { default: command } = await import(path.join(dir, folder, file));

        if (command instanceof Command) {
          this.commands.set(command.data.name, command);
        }
      }
    }
  }

  public async synchronize(guildId: string): Promise<void> {
    const body = this.commands.map((c) => c.data.toJSON());
    const encodedBody = JSON.stringify(body);

    const cache = this.getSynchronizeCache(guildId);

    if (cache === encodedBody) {
      logger.info(`Guild '${guildId}' - commands already synchronized`);

      return;
    }

    try {
      await discordREST.put(
        Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, guildId),
        { body },
      );

      this.setSynchronizeCache(guildId, encodedBody);

      logger.info(`Guild '${guildId}' - commands successfully synchronized`);
    } catch {
      logger.warn(`Guild '${guildId}' - failed to synchronize commands`);
    }
  }

  private getSynchronizeCache(id: string): string | null {
    const pathname = this.getSynchronizeCachePathname(id);

    if (!fs.existsSync(pathname)) {
      return null;
    }

    return fs.readFileSync(pathname, { encoding: "utf8" });
  }

  private setSynchronizeCache(id: string, data: string): void {
    const pathname = this.getSynchronizeCachePathname(id);

    fs.writeFileSync(pathname, data);
  }

  private getSynchronizeCachePathname(id: string): string {
    const { cacheDir } = this.config;

    return `${cacheDir}/cm_${id}.json`;
  }
}
