# fock-builder

Просто копировальный аппарат для ваших файлов

![Static Badge](https://img.shields.io/badge/fockusty-builder-builder)
![GitHub top language](https://img.shields.io/github/languages/top/fockusty/builder)
![GitHub](https://img.shields.io/github/license/fockusty/builder)
![GitHub Repo stars](https://img.shields.io/github/stars/fockusty/builder)
![GitHub issues](https://img.shields.io/github/issues/fockusty/builder)

### Установка (Windows, npm)

```
npm install fock-builder@latest
```

### config файл

```js
{
  "catalogs": [],

  "ignore_catalogs": [
    "./**/node_modules/**",
    "./**/.git",
    "./**/.obsidian",
    "./**/.github",
  ],

  "ignore_files": [
    "package-lock.json"
  ],

  "dirs": [],
  "source_files": [],
  "build_files": [],
  
  "source": "./",
  "build": "./build/"
}

/**
 * catalogs - каталог, который нужно скопировать полностью (поддерживает ** и *)
 * ignore_catalogs - каталоги, которые нужно игнорировать при копировании (поддерживает ** и *)
 * ignore_files - файлы, который нужно игнорировать при копировании (поддерживает *)
 * 
 * @deprecated
 * dirs - ваши папки
 * @deprecated
 * source_files - название файлов, которые нужно скопировать
 * @deprecated
 * build_files - название файлов, которые нужно создать
 * 
 * sorce - путь к вашей рут-папке
 * build - путь к вашей билд-папке
 */
```

### Типы
1. catalogs принимает `string[]`
- Пример: `[ "./**/*.ts" ]`

2. ignore_catalogs принимает `string[]`
- Пример: `[ "./**/my-secret-dir/**" ]`

3. ignore_files принимает `string[]`
- Пример `[ ".env" ]`

4. `@deprecated` dirs принимает `string[]` или `string[][]`
- Пример: `["assets", ["info", "md"], ["info", "txt"]]`

5. `@deprecated` source_files - принимает `string[]` или `string[][]`
- Пример `["hello.ts", "printer.js", "ico.png", ["assets", "favicon.ico"]]`
6. `@deprecated` build_files - принимает `string[]` или `string[][]`
- Пример `["hello.ts", "printer.js", "ico.png", ["assets", "favicon.ico"]]`

7. sorce - принимает `string`
- Пример: `./`
8. build - принимает `string`
- Пример: `./dist`


- Пример
```json
{
  "catalogs": [],

  "ignore_catalogs": [
    "./**/node_modules/**",
    "./**/.git",
    "./**/.obsidian",
    "./**/.github",
  ],

  "ignore_files": [
    "package-lock.json"
  ],

  "dirs": [],
  "source_files": [],
  "build_files": [],
  
  "source": "./",
  "build": "./dist/"
}
```