import "./dotenv";
import { GTTSConverter } from "./text-to-speech/gtts-converter";
import { OpenAiSTTConverter } from "./speech-to-text/openai-stt-converter";
import { OpenAiAssistant } from "./assistant/openai-assistant";

async function main() {
  const response = await new OpenAiAssistant({
    model: "gpt-3.5-turbo",
    role: "user",
  }).chat("Co sądzisz o Polsce?");

  const file = await new GTTSConverter({ outDir: "var", lang: "pl" }).convert(
    response,
  );

  const text = await new OpenAiSTTConverter({
    model: "whisper-1",
    lang: "pl",
  }).convert(file);

  console.log(text);
}

main();
