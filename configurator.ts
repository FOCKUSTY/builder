import Formatter, { Colors } from "f-formatter";
import path from "path";
import fs from "fs";

import type { Config, SettingKeys, Settings } from "./config.types";

const settings: Config = {
    fsource: [],
    fbuild: [],

    build: "./build",
    source: "./"
};

class Validator {
    private readonly _file_name: string;
    private readonly _file: string;
	private readonly _key: SettingKeys;
	private readonly _value: Settings;
	private readonly _default: Settings;

	public constructor(key: SettingKeys, value: Settings, file: string, fileName: string=".boldacfg") {
		this._file = file;
        this._file_name = fileName

		this._key = key;
		this._value = value;
		this._default = settings[key] || null;
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

        if (!value) return this.PrintValueError(`Your value at key "${key}" is not defined`);
        if (!Array.isArray(value)) return this.PathValidator(value) ? value : this.PrintValueError(`Your value at key "${key}" not that type`);

        for(const p of value) {
            const parse = path.parse(p);

            if (typeof p !== "string") return this.PrintValueError(`At your key: "${key}" a ${p} not that type`);
            if (!(parse.dir === "") || !(parse.root === "")) return this.PrintValueError(`At your key: "${key}" a ${p} not file`);
        };

        return value;
    };

    public readonly init = (): Settings => {
		const { key, value } = { key: this._key, value: this._value };

        if (!value) return this.PrintValueError(`Value at key: "${key}" is not defined`);
        if (Array.isArray(value)) return this.ArrayValidator();
        if (typeof value === "string") return this.PathValidator(value) ? value : this.PrintValueError(`Value at key: "${key}" is not that type`);
        if (typeof value !== "string") return this.PrintValueError(`Value at key: ${key} not that type`);

        return value;
    };
};

class Configurator {
	private readonly _dir: string = path.join("./");
	private readonly _config: Config = settings;
	private readonly _path: string;
	private readonly _create_file;

	public constructor(createFile: boolean = false) {
		this._path = path.join(this.ValidatePath());
		this._create_file = createFile;

		this.init();
	}

    private ValidatePath() {
        const names = [".boldacfg", ".boldacfg.prod", ".boldacfg.dev"];

        for(const name of names) {
            const file = path.join(this._dir, name);

            if (!fs.existsSync(file)) continue;
            else return file;
        };

        return path.join(this._dir, names[0]);
    };

    private Create() {
		try {
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
			JSON.stringify(JSON.parse(fs.readFileSync(this._path, "utf-8")), undefined, 0),
            this._path
		).init();
	}

    private Validate(config: Config) {
		for (const key in settings) {
			const value = this.Validator(key as SettingKeys, config[key]);

			this._config[key] = value;
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
				Colors.brightYellow +
					"Your config is empty, returning to default" +
					Colors.reset
			);

			fs.unlinkSync(this._path);
			this.Create();
		}

		try {
			const config: Config = new Formatter().FromJSONWithPath(this._path);

			this.Validate(config);
		} catch (err: any) {
			if (!fs.existsSync(this._path)) return;

			throw new Error(err);
		}
    }

	private readonly init = () => {
		this.Read();
	};

	get config(): Config {
		return this._config;
	}
};

(() => {
    new Configurator(false);
})();

export default Configurator;