import path, { join } from "path";
import fs from "fs";

import type {
  StandartSettings as Settings,
  SettingKeys,
  InputSettings,
  OldConfigType
} from "./config.types";

const regexp = /\.boldacfg\.([a-z]+)/;
const settings: OldConfigType = {
  dirs: [],

  fsource: [],
  fbuild: [],

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

  private readonly PrintValueError = (error: string): Settings => {
    console.log("To fixing error:");
    console.log("Open " + this._file_name);

    console.log(error);

    console.log("See your file:");
    console.log(this._file);
    console.log();

    return this._default;
  };

  private readonly PathValidator = (path: string): boolean => {
    if (typeof path !== "string") return false;
    if (!path.startsWith("./") && !path.startsWith("../")) return false;

    return true;
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

      if (typeof vPath !== "string" && !Array.isArray(array))
        return this.PrintValueError(
          `At your key: "${key}" a ${vPath} not that type`
        );

      if (
        (!(parsed.dir === "") || !(parsed.root === "")) &&
        !Array.isArray(array)
      )
        return this.PrintValueError(
          `At your key: "${key}" a ${vPath} not file`
        );
    }

    return value as Settings;
  };

  public readonly init = (): Settings => {
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
    const names = [".boldacfg.dev", ".boldacfg.prod", ".boldacfg"];

    const filteted: string[] = [];
    const files = fs
      .readdirSync(this._dir)
      .filter((name) => name.match(regexp));

    for (const name of files) {
      const matched = name.match(regexp);

      if (!matched) continue;
      if (matched.input !== matched[0]) continue;
      if (name.includes(".example")) continue;

      filteted.push(name);
    }

    for (const ffile of filteted) {
      if (names.includes(ffile)) {
        const file = path.join(this._dir, ffile);

        if (!fs.existsSync(file)) continue;
        else return file;
      } else if (regexp.test(ffile)) {
        return path.join(this._dir, ffile);
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
        0
      ),
      this._path
    ).init();
  }

  private Validate(config: OldConfigType) {
    if (!config.fbuild) return;
    if (!config.fsource) return;

    if (config.fbuild.length < config.fsource.length)
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
  }

  private Read() {
    if (!fs.existsSync(this._path) && this._create_file) this.Create();

    if (
      fs.existsSync(this._path) &&
      Object.keys(JSON.parse(fs.readFileSync(this._path, "utf-8") || "{}"))
        .length === 0
    ) {
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
