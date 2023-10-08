import "./dotenv";
import { engine } from "./engine";

async function main() {
  const response = await engine.assistant.chat("Jak wyobrażasz sobie przyszłość?");

  const file = await engine.tts.convert(response);

  const text = await engine.stt.convert(file);

  console.log(text);
}

main();
