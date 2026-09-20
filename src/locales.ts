// locales.ts

export const en = {
  "settings-heading": "Kanban Auto Linker Settings",
  "lang-select-name": "Interface Language",
  "lang-select-desc": "Choose the plugin interface language.",
  "watch-folder-name": "Watch Folder",
  "watch-folder-desc": "The folder where you create task files (e.g., tasks)",
  "kanban-path-name": "Kanban Board Path",
  "kanban-path-desc": "Path to the board file from the vault root (e.g., Boards/board.md)",
  "target-column-name": "Column Name for New Tasks",
  "target-column-desc": "Heading where new tasks will be added (e.g., ## Backlog)",
  "ignored-columns-name": "Ignored Columns (Statuses)",
  "ignored-columns-desc": "Comma-separated list of columns where tasks should NOT be tracked or deleted if the file is removed (e.g., ## Done, ## Archive)",
  "command-open-settings": "Open Kanban Auto Linker Settings"
};

export const ru: typeof en = {
  "settings-heading": "Настройки Kanban Auto Linker",
  "lang-select-name": "Язык интерфейса",
  "lang-select-desc": "Выберите язык интерфейса плагина.",
  "watch-folder-name": "Папка отслеживания",
  "watch-folder-desc": "Папка, в которой вы создаете файлы задач (например: tasks)",
  "kanban-path-name": "Путь к kanban-доске",
  "kanban-path-desc": "Путь к файлу доски от корня хранилища (например: Boards/board.md)",
  "target-column-name": "Имя колонки для новых задач",
  "target-column-desc": "Заголовок, куда добавлять новые задачи (например: ## Backlog)",
  "ignored-columns-name": "Игнорируемые колонки (Статусы)",
  "ignored-columns-desc": "Список колок через запятую, в которых НЕ нужно искать и удалять задачи, если файл удален (например: ## Done, ## Архив)",
  "command-open-settings": "Открыть настройки Kanban Auto Linker"
};

export const resources = {
  en: { translation: en },
  ru: { translation: ru }
};

export type LanguageType = 'auto' | 'en' | 'ru';
