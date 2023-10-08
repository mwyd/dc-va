import { TextToSpeechConverter } from "./tts/tts-converter";
import { SpeechToTextConverter } from "./stt/stt-converter";
import { Assistant } from "./assistant/assistant";

export class Engine {
  constructor(
    public readonly tts: TextToSpeechConverter,
    public readonly stt: SpeechToTextConverter,
    public readonly assistant: Assistant,
  ) {}
}
