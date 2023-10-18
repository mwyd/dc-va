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

    const files = fs.readdirSync(dir).filter(filter);

    for (const file of files) {
      const { default: command } = await import(path.join(__dirname, file));

      if (command instanceof Command) {
        this.commands.set(command.data.name, command);
      }
    }
  }

  public async synchronize(): Promise<void> {
    const body = this.commands.map((c) => c.data.toJSON());
    const encodedBody = JSON.stringify(body);

    const cache = this.getSynchronizeCache();

    if (cache === encodedBody) {
      logger.info("Commands already synchronized");

      return;
    }

    try {
      await discordREST.put(
        Routes.applicationGuildCommands(
          process.env.DISCORD_CLIENT_ID,
          process.env.DISCORD_GUILD_ID,
        ),
        { body },
      );

      this.setSynchronizeCache(encodedBody);

      logger.info("Commands successfully synchronized");
    } catch {
      logger.warn("Failed to synchronize commands");
    }
  }

  private getSynchronizeCache(): string | null {
    const pathname = this.getSynchronizeCachePathname();

    if (!fs.existsSync(pathname)) {
      return null;
    }

    return fs.readFileSync(pathname, { encoding: "utf8" });
  }

  private setSynchronizeCache(data: string): void {
    const pathname = this.getSynchronizeCachePathname();

    fs.writeFileSync(pathname, data);
  }

  private getSynchronizeCachePathname(): string {
    const { cacheDir } = this.config;

    return `${cacheDir}/_command_manager_sync_cache.json`;
  }
}
