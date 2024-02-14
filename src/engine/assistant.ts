export interface Assistant {
  chat(message: string): AsyncGenerator<string>;
}
