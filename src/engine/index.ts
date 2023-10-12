import { TextToSpeechConverter } from "./tts/tts-converter";
import { SpeechToTextConverter } from "./stt/stt-converter";
import { Assistant } from "./assistant/assistant";

export class Engine {
  constructor(
    private readonly tts: TextToSpeechConverter,
    private readonly stt: SpeechToTextConverter,
    private readonly assistant: Assistant,
  ) {}

  public async process(file: string): Promise<string> {
    const text = await this.stt.convert(file);
    const response = await this.assistant.chat(text);

    return this.tts.convert(response);
  }
}
