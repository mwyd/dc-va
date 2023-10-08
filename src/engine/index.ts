import { TextToSpeechConverter } from "./tts/tts-converter";
import { SpeechToTextConverter } from "./stt/stt-converter";
import { Assistant } from "./assistant/assistant";
import { GTTSConverter } from "./tts/gtts-converter";
import { OpenAISTTConverter } from "./stt/openai-stt-converter";
import { OpenAIAssistant } from "./assistant/openai-assistant";

class Engine {
  constructor(
    public readonly tts: TextToSpeechConverter,
    public readonly stt: SpeechToTextConverter,
    public readonly assistant: Assistant,
  ) {}
}

export const engine = new Engine(
  new GTTSConverter({ outDir: "var", lang: "pl" }),
  new OpenAISTTConverter({ model: "whisper-1", lang: "pl" }),
  new OpenAIAssistant({ model: "gpt-3.5-turbo", role: "user" }),
);
