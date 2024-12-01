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
    "fsource": [],
    "fbuild": [],
    
    "source": "",
    "build": ""
}

/**
 * fsource - название файлов, которые нужно скопировать
 * fbuild - название файлов, которые нужно создать
 * 
 * sorce - путь к вашей рут-папке
 * build - путь к вашей билд-папке
 */
```

- Пример
```json
{
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