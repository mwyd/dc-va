export interface SpeechToTextConverter {
  convert(file: string): Promise<string>;
}
