export interface Assistant {
  chat(message: string): Promise<string>;
}
