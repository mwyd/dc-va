import "./dotenv";
import { GTTSConverter } from "./voice-assistant/text-to-speech/gtts-converter";

new GTTSConverter({ outDir: "var", lang: "pl" })
  .convert("Ten tekst został przekonwertowany za pomocą biblioteki gTTS");
