import { App, PluginSettingTab, Setting } from 'obsidian';
import KanbanAutoLinker from './main';

export interface KanbanLinkerSettings {
  watchFolder: string;
  kanbanPath: string;
  targetColumn: string;
  ignoredColumns: string; // Новое поле для игнорируемых колонок
}

export const DEFAULT_SETTINGS: KanbanLinkerSettings = {
  watchFolder: 'tasks',
  kanbanPath: 'Board.md',
  targetColumn: '## Backlog',
  ignoredColumns: '## Done, ## Архив' // Значение по умолчанию
}

export class KanbanLinkerSettingTab extends PluginSettingTab {
  plugin: KanbanAutoLinker;

  constructor(app: App, plugin: KanbanAutoLinker) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl).setName('Настройки').setHeading();

    new Setting(containerEl)
      .setName('Папка отслеживания')
      .setDesc('Папка, в которой вы создаете файлы задач (например: tasks)')
      .addText(text => text
        .setValue(this.plugin.settings.watchFolder)
        .onChange(async (value) => {
          this.plugin.settings.watchFolder = value.trim().replace(/\/$/, "");
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Путь к kanban-доске')
      .setDesc('Путь к файлу доски от корня хранилища (например: Boards/board.md)')
      .addText(text => text
        .setValue(this.plugin.settings.kanbanPath)
        .onChange(async (value) => {
          this.plugin.settings.kanbanPath = value.trim();
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Имя колонки для новых задач')
      .setDesc('Заголовок, куда добавлять новые задачи (например: ## Backlog)')
      .addText(text => text
        .setValue(this.plugin.settings.targetColumn)
        .onChange(async (value) => {
          this.plugin.settings.targetColumn = value.trim();
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Игнорируемые колонки (Статусы)')
      .setDesc('Список колонок через запятую, в которых НЕ нужно искать и удалять задачи, если файл удален (например: ## Done, ## Архив)')
      .addText(text => text
        .setValue(this.plugin.settings.ignoredColumns)
        .onChange(async (value) => {
          this.plugin.settings.ignoredColumns = value;
          await this.plugin.saveSettings();
        }));
  }
}
