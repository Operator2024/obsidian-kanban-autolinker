import obsidianmd from 'eslint-plugin-obsidianmd';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

export default defineConfig(
	globalIgnores([
		'node_modules',
		'dist',
		'esbuild.config.mjs',
		'version-bump.mjs',
		'versions.json',
		'main.js',
		'package.json',
		'package-lock.json',
		'tsconfig.json',
	]),
	{
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: ['eslint.config.mts', 'manifest.json'],
				},
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.json'],
			},
		},
	},
	...obsidianmd.configs.recommended,
	{
		rules: {
			// Отключаем стандартную ошибку, чтобы она не дублировалась
			'no-console': 'off',

			// Настраиваем наше кастомное сообщение
			'obsidianmd/rule-custom-message': [
				'error',
				{
					'no-console': {
						messages: {
							'Unexpected console statement.': 'Пожалуйста, удалите console.log перед публикацией плагина! Используйте new Notice() для уведомлений.'
						},
						options: [{ allow: ['warn', 'error'] }]
					}
				}
			]
		}
	}
);
