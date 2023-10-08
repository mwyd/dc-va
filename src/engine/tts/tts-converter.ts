export interface TextToSpeechConverter {
  convert(text: string): Promise<string>;
}
