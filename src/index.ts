import "./dotenv";
import { GTTSConverter } from "./text-to-speech/gtts-converter";
import { OpenAiSTTConverter } from "./speech-to-text/openai-stt-converter";

async function main() {
  const file = await new GTTSConverter({ outDir: "var", lang: "pl" }).convert(
    "Ten tekst został przekonwertowany za pomocą biblioteki gTTS",
  );

  const text = await new OpenAiSTTConverter({
    model: "whisper-1",
    lang: "pl",
  }).convert(file);

  console.log(text);
}

main();
