import { TOptions } from 'i18next';
import { App, PluginSettingTab, Setting } from 'obsidian';
import { LanguageType } from './locales';
import KanbanAutoLinker from './main';

export interface KanbanLinkerSettings {
  language: LanguageType;
  watchFolder: string;
  kanbanPath: string;
  targetColumn: string;
  ignoredColumns: string;
}

export const DEFAULT_SETTINGS: KanbanLinkerSettings = {
  language: 'auto',
  watchFolder: 'tasks',
  kanbanPath: 'Board.md',
  targetColumn: '## Backlog',
  ignoredColumns: '## Done, ## Архив'
}

export class KanbanLinkerSettingTab extends PluginSettingTab {
  plugin: KanbanAutoLinker;

  constructor(app: App, plugin: KanbanAutoLinker) {
    super(app, plugin);
    this.plugin = plugin;
  }

  t(key: keyof typeof import('./locales').en, options?: TOptions): string {
    return this.plugin.translator.t(key, options);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl).setName(this.t('settings-heading')).setHeading();

    new Setting(containerEl)
      .setName(this.t('lang-select-name'))
      .setDesc(this.t('lang-select-desc'))
      .addDropdown(dropdown => dropdown
        .addOption('auto', 'System (auto)')
        .addOption('en', 'English')
        .addOption('ru', 'Русский')
        .setValue(this.plugin.settings.language)
        .onChange(async (value: string) => {
          const selectedLang = value as LanguageType;
          this.plugin.settings.language = selectedLang;
          await this.plugin.saveSettings();

          await this.plugin.translator.changeLanguage(selectedLang);

          this.display();
        })
      );

    new Setting(containerEl)
      .setName(this.t('watch-folder-name'))
      .setDesc(this.t('watch-folder-desc'))
      .addText(text => text
        .setValue(this.plugin.settings.watchFolder)
        .onChange(async (value) => {
          this.plugin.settings.watchFolder = value.trim().replace(/\/$/, "");
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(this.t('kanban-path-name'))
      .setDesc(this.t('kanban-path-desc'))
      .addText(text => text
        .setValue(this.plugin.settings.kanbanPath)
        .onChange(async (value) => {
          this.plugin.settings.kanbanPath = value.trim();
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(this.t('target-column-name'))
      .setDesc(this.t('target-column-desc'))
      .addText(text => text
        .setValue(this.plugin.settings.targetColumn)
        .onChange(async (value) => {
          this.plugin.settings.targetColumn = value.trim();
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(this.t('ignored-columns-name'))
      .setDesc(this.t('ignored-columns-desc'))
      .addText(text => text
        .setValue(this.plugin.settings.ignoredColumns)
        .onChange(async (value) => {
          this.plugin.settings.ignoredColumns = value;
          await this.plugin.saveSettings();
        }));
  }
}
