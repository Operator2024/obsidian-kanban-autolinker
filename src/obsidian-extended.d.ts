import 'obsidian';

declare module 'obsidian' {
  interface TFile {
    /**
     * Флаг, указывающий, был ли файл удален.
     * Существует в рантайме Obsidian, но отсутствует в официальном API.
     */
    deleted: boolean;
  }
}
