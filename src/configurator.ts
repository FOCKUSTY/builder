import path, { join } from "path";
import fs from "fs";

import type {
  StandartSettings as Settings,
  SettingKeys,
  InputSettings,
  OldConfigType
} from "./config.types";

const CATALOG_REGULAR_EXPRESSION = /(\.\/|\.\.\/)([\w*]+\/?)+/gi;
const CONFIG_REGULAR_EXPRESSION = /\.boldacfg.*/;
const CONFIG_NAMES = [
  ".boldacfg.dev.json",
  ".boldacfg.prod.json",
  ".boldacfg.json",

  ".boldacfg.dev",
  ".boldacfg.prod",
  ".boldacfg"
];
export const EXCLUDE = [
  "./**/node_modules",
  "./**/.git",
  "./**/.obsidian",
  "./**/.github"
];
export const IGNORE_FILES = [
  ".boldacfg.*",
  ".prettierrc*",
  "package-lock.json"
];

const settings: OldConfigType = {
  catalogs: [],
  ignore_catalogs: EXCLUDE,
  ignore_files: IGNORE_FILES,
  dirs: [],

  source_files: [],
  build_files: [],

  build: "./build",
  source: "./"
};

class Validator {
  private readonly _file_name: string;
  private readonly _file: string;
  private readonly _key: SettingKeys;
  private readonly _value: InputSettings;
  private readonly _default: Settings;

  public constructor(
    key: SettingKeys,
    value: InputSettings,
    file: string,
    fileName: string = ".boldacfg"
  ) {
    this._file = file;
    this._file_name = fileName;

    this._key = key;
    this._value = value;
    this._default = settings[key];
  }

  public init(): Settings {
    const { key, value } = { key: this._key, value: this._value };

    console.log("validating " + "\u001B[33;1m" + key + "\u001B[0m" + "...");

    if (!value)
      return this.PrintValueError(`Value at key: "${key}" is not defined`);

    if (Array.isArray(value)) return this.ArrayValidator();

    if (typeof value === "string")
      return this.PathValidator(value)
        ? value
        : this.PrintValueError(`Value at key: "${key}" is not that type`);

    if (typeof value !== "string")
      return this.PrintValueError(`Value at key: ${key} not that type`);

    return value;
  }

  private readonly PathValidator = (path: string): boolean => {
    if (typeof path !== "string") return false;
    if (!path.startsWith("./") && !path.startsWith("../")) return false;

    return true;
  };

  private readonly CatalogValidator = (
    catalogs: string[] | string[][]
  ): boolean => {
    return catalogs.every((catalog) => {
      if (Array.isArray(catalog))
        return this.PrintValueError(
          'Your value in key "catalogs" is not a string',
          false
        );
      if (!this.PathValidator(catalog))
        return this.PrintValueError(
          'Your value in key "catalogs" is failed path validation',
          false
        );

      const matched = catalog.match(CATALOG_REGULAR_EXPRESSION);

      if (!matched)
        return this.PrintValueError(
          'Your value in key "catalogs" is failed path validation',
          false
        );

      return true;
    });
  };

  private readonly PrintValueError = <T>(error: string, ret?: T) => {
    console.log("To fixing error:");
    console.log("Open " + this._file_name);

    console.log(error);

    console.log("See your file:");
    console.log(this._file);
    console.log();

    return ret ? ret : this._default;
  };

  private readonly ArrayValidator = (): Settings => {
    const { key, value } = { key: this._key, value: this._value };

    if (!value)
      return this.PrintValueError(`Your value at key "${key}" is not defined`);

    if (!Array.isArray(value))
      return this.PathValidator(value)
        ? value
        : this.PrintValueError(`Your value at key "${key}" not that type`);

    for (const index in value) {
      const array = value[index];

      if (Array.isArray(array)) value[index] = join(...array);

      const vPath = value[index] as string;
      const parsed = path.parse(vPath);

      const isArrayValid = typeof vPath === "string" || Array.isArray(array);
      if (!isArrayValid)
        return this.PrintValueError(
          `At your key: "${key}" a ${vPath} not that type`
        );

      const isCatalog = key === "catalogs";
      if (isCatalog) {
        return this.CatalogValidator(value)
          ? (value as string[])
          : this.PrintValueError(
              `Your value at key "${key} is not failed validation"`
            );
      }

      const isIgnoreCatalogs = key === "ignore_catalogs";
      if (isIgnoreCatalogs) {
        return value.every((v) => typeof v === "string")
          ? value
          : this.PrintValueError(`Your value at key "${key} is not a string"`);
      }

      const isNotFile =
        (!(parsed.dir === "") || !(parsed.root === "")) &&
        !Array.isArray(array);
      if (isNotFile) {
        return this.PrintValueError(
          `At your key: "${key}" a ${vPath} not file`
        );
      }
    }

    return value as Settings;
  };
}

class Configurator {
  private readonly _dir: string = path.join("./");
  private readonly _config: OldConfigType = settings;
  private readonly _path: string;
  private readonly _create_file;

  public constructor(createFile: boolean = false) {
    this._path = path.join(this.ValidatePath());
    this._create_file = createFile;

    this.init();
  }

  private ValidatePath() {
    const filtered: string[] = [];
    const files = fs
      .readdirSync(this._dir)
      .filter((name) => name.match(CONFIG_REGULAR_EXPRESSION));

    for (const name of files) {
      const matched = name.match(CONFIG_REGULAR_EXPRESSION);

      if (!matched) continue;
      if (matched.input !== matched[0]) continue;
      if (name.includes(".example")) continue;

      filtered.push(name);
    }

    for (const filteredFile of filtered) {
      const file = path.join(this._dir, filteredFile);

      if (CONFIG_NAMES.includes(filteredFile)) {
        if (!fs.existsSync(file)) continue;
        else return file;
      } else if (CONFIG_REGULAR_EXPRESSION.test(filteredFile)) {
        return path.join(this._dir, filteredFile);
      }
    }

    return path.join(this._dir, ".boldacfg");
  }

  private Create() {
    try {
      console.log("config creating...");

      const file = JSON.stringify(settings, undefined, 4);
      fs.writeFileSync(this._path, file, "utf-8");

      return settings;
    } catch (err: any) {
      throw new Error(err);
    }
  }

  private Validator(key: SettingKeys, value: Settings): Settings {
    return new Validator(
      key,
      value,
      JSON.stringify(
        JSON.parse(fs.readFileSync(this._path, "utf-8")),
        undefined,
        2
      ),
      this._path
    ).init();
  }

  private Validate(config: OldConfigType) {
    if (!config.build_files) return;
    if (!config.source_files) return;

    if (config.build_files.length < config.source_files.length)
      throw new Error("build files must be more or equal than source");

    for (const k in settings) {
      const key: SettingKeys = k as any;
      const value = this.Validator(key, config[key] || settings[key]);

      if (settings[key]?.toString() !== value?.toString())
        console.log(
          "\u001B[33;1m" + key + "\u001B[0m" + " is passed validation"
        );
      else
        console.log(
          "\u001B[33;1m" + key + "\u001B[0m" + " is returned to default"
        );

      this._config[key] = value as any;
    }

    this.config.ignore_catalogs.push(this.config.build + "/*");
  }

  private Read() {
    if (!fs.existsSync(this._path) && this._create_file) {
      this.Create();
    }

    const isEmpty =
      fs.existsSync(this._path) &&
      Object.keys(JSON.parse(fs.readFileSync(this._path, "utf-8") || "{}"))
        .length === 0;
    if (isEmpty) {
      console.log(
        "\u001B[33;1m" +
          "Your config is empty, returning to default" +
          "\u001B[0m"
      );

      fs.unlinkSync(this._path);
      this.Create();
    }

    try {
      let file: any;
      const json = fs.readFileSync(path.join(this._path), {
        encoding: "utf-8"
      });
      JSON.stringify(json, (_, value) => {
        eval(`file = ${value}`);
      });

      this.Validate(file);
    } catch (err: any) {
      if (!fs.existsSync(this._path)) return;

      throw new Error(err);
    }
  }

  private readonly init = () => {
    this.Read();
  };

  get config(): OldConfigType {
    return this._config;
  }
}

export default Configurator;
