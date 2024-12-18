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
    "dirs": [],
    "fsource": [],
    "fbuild": [],
    
    "source": "",
    "build": ""
}

/**
 * dirs - ваши папки
 * fsource - название файлов, которые нужно скопировать
 * fbuild - название файлов, которые нужно создать
 * 
 * sorce - путь к вашей рут-папке
 * build - путь к вашей билд-папке
 */
```

### типы
1. dirs принимает `string` или `string[]`
- Примеры: `["assets", ["info", "md"], ["info", "txt"]]`

2. fsource - принимает `string` или `string[]`
- Примеры `["hello.ts", "printer.js", "ico.png", ["assets", "favicon.ico"]]`
3. fbuild - принимает `string` или `string[]`
- Примеры `["hello.ts", "printer.js", "ico.png", ["assets", "favicon.ico"]]`

4. sorce - принимает `string`
- Примеры: `./`
5. build - принимает `string`
- Примеры: `./dist`


- Пример
```json
{
    "dirs": [
        "assets"
    ],

    "fsource": [
        "README.md",
        "LICENSE",
        ".gitignore",
        ".prettierrc",
        "package.json"
    ],
    "fbuild": [
        "README.md",
        "LICENSE",
        ".gitignore",
        ".prettierrc",
        "package.json"
    ],
    
    "source": "./",
    "build": "../dist/"
}
```