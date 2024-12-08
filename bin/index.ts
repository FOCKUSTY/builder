import yargs, { Options as Yargs } from "yargs";

import path from "path";
import fs from "fs";

const usage = "\nUsage: fockbuilder --start to build your files";

type Key = "start" | "config";
interface Options extends Yargs {
	name: string;
}
interface Command {
	execute: () => void;
}

const keys: Key[] = ["start", "config"];
const options: Record<Key, Options> = {
	"start": {
		name: "S",
		alias: "start",
		describe: "Старт сборки",
		boolean: true,
		default: false
	},
	"config": {
		name: "C",
		alias: "config",
		describe: "Создание конфига",
		boolean: true,
		default: false
	}
};

const settings: any = yargs
	.usage(usage)
	.option(options.start.name, options.start)
	.option(options.config.name, options.config).argv;

class Listener {
	private readonly options: Key[] = [];

	public constructor() {
		this.init();
	}

	private readonly init = () => {
		for (const key in settings)
			if (
				keys.includes(key as Key) &&
				settings[key] === true &&
				typeof settings[key] === "boolean"
			)
				this.options.push(key as Key);

		this.execute();
	};

	private readonly execute = () => {
		const folderPath = path.join(__dirname, "commands");
		const folder = fs.readdirSync(folderPath);

		if (this.options.length === 0) {
			const commandsPath = path.join(__dirname, "commands");

			if (fs.existsSync(path.join(commandsPath, "start.ts")))
				return new (require(
					path.join(__dirname, "commands", "start.ts")
				).default)().execute();
			else
				return new (require(
					path.join(__dirname, "commands", "start.js")
				).default)().execute();
		}

		for (const fileName of folder) {
			const filePath = path.join(folderPath, fileName);
			const name = path.parse(filePath).name as Key;

			if (!this.options.includes(name)) continue;

			const command: Command = new (require(`${filePath}`).default)();

			command.execute();
		}
	};
}

(() => {
	new Listener();
})();
