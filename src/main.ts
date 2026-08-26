import { Notice, Plugin, TAbstractFile, TFile } from 'obsidian';
import { DEFAULT_SETTINGS, KanbanLinkerSettings, KanbanLinkerSettingTab } from './settings';

export default class KanbanAutoLinker extends Plugin {
  settings!: KanbanLinkerSettings;
  private isReady = false; // Флаг для защиты от ложных срабатываний при старте

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new KanbanLinkerSettingTab(this.app, this));

    // Разрешаем работу плагина только после того, как Obsidian полностью загрузит хранилище
    this.app.workspace.onLayoutReady(() => {
      // Небольшая задержка в 3 секунды, чтобы завершился внутренний поиск/индексация файлов Obsidian
      window.setTimeout(() => {
        this.isReady = true;
        console.log("[kanban linker] Плагин успешно запущен и готов к работе.");
      }, 3000);
    });

    // 1. СОЗДАНИЕ ФАЙЛА
    this.registerEvent(
      this.app.vault.on('create', (file: TAbstractFile) => {
        void (async () => {
          if (!this.isReady) return;
          if (this.isTargetFile(file) && file instanceof TFile) {
            if (await this.hasFileInKanban(file.basename)) {
              return;
            }
            await this.addFileToKanban(file.basename);
          }
        })();
      })
    );

    // 2. УДАЛЕНИЕ ФАЙЛА
    this.registerEvent(
      this.app.vault.on('delete', (file: TAbstractFile) => {
        void (async () => {
          if (!this.isReady) return;
          if (this.isTargetFile(file) && file instanceof TFile) {
            await this.removeFileFromKanban((file).basename);
          }
        })();
      })
    );

    // 3. ПЕРЕИМЕНОВАНИЕ ФАЙЛА
    // this.registerEvent(
    //   this.app.vault.on('rename', (file: TAbstractFile, oldPath: string) => {
    //     void (async () => {
    //       if (!this.isReady) return;
    //       if (this.isTargetFile(file) && !await this.hasFileInKanban((file as TFile).basename)) {
    //         const oldBaseName = oldPath.split('/').pop()?.replace('.md', '');
    //         const config = this.app.vault.config.alwaysUpdateLinks;
    //         // this.app.vault.getConfig('alwaysUpdateLinks');
    //         console.log('alwaysUpdateLinks', config, oldBaseName);
    //         if (oldBaseName) {
    //           await this.renameFileInKanban(oldBaseName, (file as TFile).basename);
    //         }
    //       }
    //     })();
    //   })
    // );
  }

  /**
   *
   * @param file - Проверяем, является ли файл целевым для добавления на доску Kanban.
   * Целевыми считаются файлы с расширением .md, находящиеся в указанной папке отслеживания.
   * @returns - Возвращает true, если файл является целевым, иначе false.
   */
  private isTargetFile(file: TAbstractFile): boolean {
    if (!(file instanceof TFile) || file.extension !== 'md') return false;
    const cleanWatchFolder = this.settings.watchFolder.trim().replace(/^\/+|\/+$/g, '').toLowerCase();
    if (file.deleted) {
      return file.path.toLocaleLowerCase().includes(cleanWatchFolder);
    }
    const fileFolder = file.parent ? file.parent.path.replace(/^\/+|\/+$/g, '').toLowerCase() : '';
    return fileFolder === cleanWatchFolder || fileFolder.startsWith(cleanWatchFolder + '/');
  }


  /**
   *
   * @returns Promise<TFile> - Возвращает объект TFile доски Kanban. Если файл не найден, выбрасывает ошибку.
   */
  private async getKanbanFile(): Promise<TFile> {
    const cleanKanbanPath = this.settings.kanbanPath.trim().replace(/^\/+/g, '');
    const kanbanFile = this.app.vault.getAbstractFileByPath(cleanKanbanPath);

    if (!(kanbanFile instanceof TFile)) {
      throw new Error(`[kanban linker] Ошибка: Доска не найдена по пути "${cleanKanbanPath}"`);
    }
    return kanbanFile;
  }

  /**
   *
   * @returns Promise<string> - Возвращает содержимое файла доски Kanban в виде строки.
   * Если файл не найден, выбрасывает ошибку.
   */
  private async getKanbanContent(): Promise<string> {
    const kanbanFile = await this.getKanbanFile();
    return await this.app.vault.read(kanbanFile);
  }

  /**
   *
   * @param fileName - Имя файла задачи (без расширения .md)
   * @returns Promise<boolean> - Возвращает true, если файл уже упомянут на доске Kanban, иначе false.
   * Если произошла ошибка при чтении файла доски, возвращает true (чтобы предотвратить добавление дубликатов).
   */
  private async hasFileInKanban(fileName: string): Promise<boolean> {
    try {
      let content = await this.getKanbanContent();
      const taskLink = `[[${fileName}]]`;

      // Проверка: Если такая заметка уже упомянута на доске (в любой колонке)
      if (content.includes(taskLink)) {
        new Notice(`[kanban linker] Заметка "${fileName}" уже есть на доске! Дублирование невозможно.`, 5000);
        return true;
      }
      return false;
    }
    catch (error) {
      console.error('[kanban linker]', error);
      return true;
    }
  }

  /**
   *
   * @param fileName - Имя файла задачи (без расширения .md)
   * @returns Promise<void> - Добавляет задачу на доску Kanban в указанную колонку.
   * Если колонка не найдена, выводит уведомление об ошибке. Если задача уже существует на доске, выводит уведомление о дублировании.
   */
  // Функция: Добавление задачи на доску (с проверкой дубликатов)
  async addFileToKanban(fileName: string) {
    // const cleanKanbanPath = this.settings.kanbanPath.trim().replace(/^\/+/g, '');
    const kanbanFile = await this.getKanbanFile();

    // if (!(kanbanFile instanceof TFile)) {
    //   new Notice(`[kanban linker] Ошибка: Доска не найдена по пути "${cleanKanbanPath}"`);
    //   return;
    // }

    let content = await this.app.vault.read(kanbanFile);
    const taskLink = `[[${fileName}]]`;

    // Проверка: Если такая заметка уже упомянута на доске (в любой колонке)
    // if (content.includes(taskLink)) {
    //   new Notice(`[kanban linker] Заметка "${fileName}" уже есть на доске! Дублирование невозможно.`, 5000);
    //   return;
    // }

    const columnHeader = this.settings.targetColumn.trim();
    if (!content.includes(columnHeader)) {
      new Notice(`[kanban linker] Ошибка: Колонка "${columnHeader}" не найдена на доске.`);
      return;
    }

    const taskLine = `- [ ] ${taskLink}`;
    content = content.replace(columnHeader, `${columnHeader}\n${taskLine}`);
    await this.app.vault.modify(kanbanFile, content);
    new Notice(`[kanban linker] Задача "${fileName}" добавлена в ${columnHeader}`);
  }

  /**
   *
   * @param fileName - Имя файла задачи (без расширения .md)
   * @returns Promise<void> - Удаляет задачу с доски Kanban, если она находится в рабочей колонке.
   * Если задача находится в игнорируемой колонке, выводит уведомление и не удаляет её. Если задача не найдена на доске, ничего не делает.
   */
  // Функция: Умное удаление задачи с доски
  async removeFileFromKanban(fileName: string) {
    const kanbanFile = await this.getKanbanFile();

    let content = await this.app.vault.read(kanbanFile);
    const taskLink = `[[${fileName}]]`;

    // Если ссылки вообще нет в файле — ничего не делаем
    if (!content.includes(taskLink)) return;

    // Разбиваем файл на массив строк (убирая \r для Windows)
    const lines = content.replace(/\r/g, '').split('\n');

    // Получаем чистый список игнорируемых колонок
    const ignoredColumns = this.settings.ignoredColumns.split(',').map(col => col.trim());

    // Ищем индекс строки, в которой есть ссылка на нашу задачу
    const targetLineIndex = lines.findIndex(line => line.includes(taskLink));
    if (targetLineIndex === -1) return;

    // Ищем заголовок колонки: идём от нашей строки вверх до первой строки с "## "
    let columnName = "";
    for (let i = targetLineIndex; i >= 0; i--) {
      const line = lines[i];
      if (line?.startsWith('## ')) {
        columnName = line.trim();
        break;
      }
    }

    // Проверяем, нужно ли игнорировать эту колонку (например, ## Done)
    const isIgnored = ignoredColumns.some(ignoredCol => columnName.startsWith(ignoredCol));

    if (isIgnored) {
      new Notice(`[kanban linker] Файл не удален с доски, т.к. находится в игнорируемом столбце.`);
      return;
    }

    // Если колонка рабочая — просто удаляем эту конкретную строку из массива
    lines.splice(targetLineIndex, 1);

    // Собираем файл обратно и сохраняем
    await this.app.vault.modify(kanbanFile, lines.join('\n'));
    new Notice(`[kanban linker] Задача "${fileName}" удалена с доски.`);
  }

  /**
   *  Загружает настройки плагина из хранилища, объединяя их с настройками по умолчанию.
   * Если настройки не найдены, используются значения по умолчанию.
   */
  async loadSettings() {
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...(await this.loadData() as Partial<KanbanLinkerSettings>)
    };
  }

  /**
   *  Сохраняет текущие настройки плагина в хранилище.
   */
  async saveSettings() {
    await this.saveData(this.settings);
  }
}
