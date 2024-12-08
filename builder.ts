import Configurator from "./configurator";

import { join, parse } from "path";
import fs from "fs";

const { config } = new Configurator();

class Builder {
	private readonly _build = join("./", config.build);

	private readonly CreateDir = (dirPath: string = this._build) => {
		if (!fs.existsSync(dirPath)) {
			console.log("creating dir...");

			fs.mkdirSync(dirPath);
		} else {
			console.log("cleaning dir...");

			const files = fs.readdirSync(dirPath);

			for (const index in files) {
				const file = files[index];

				if (!config.fsource.includes(file as any)) continue;

				fs.unlinkSync(join(dirPath, file));
			}
		}
	};

	private readonly CopyFile = (filePath: string, buildPath: string) => {
		const parsed = parse(filePath);
		const builded = parse(buildPath);

		if (!fs.existsSync(filePath)) return;

		if (fs.existsSync(buildPath)) {
			console.log(
				"deleting " +
					"\u001B[33;1m" +
					builded.name +
					builded.ext +
					"\u001B[0m" +
					"..."
			);
			fs.unlinkSync(buildPath);
		}

		console.log(
			"copying " + "\u001B[33;1m" + parsed.name + parsed.ext + "\u001B[0m" + "..."
		);

		fs.copyFileSync(filePath, buildPath);
		console.log("copyied!");
	};

	private readonly CopyFiles = (files: string[]) => {
		this.CreateDir();

		for (const index in files) {
			const file = files[index];

			const filePath = join(config.source, file);
			const buildPath = config.fbuild[index];

			this.CopyFile(filePath, join(config.build, buildPath));
		}
	};

	private readonly CopyDirs = (dirs: string[]) => {
		for (const dir of dirs) {
			if (Array.isArray(dir)) {
				let fullDir: string[] = [];

				for (const d of dir) {
					fullDir.push(d);
					this.CreateDir(join(this._build, ...fullDir));
				}
			} else this.CreateDir(join(this._build, dir));
		}
	};

	public execute() {
		this.CopyDirs(config.dirs);
		this.CopyFiles(config.fsource);
	}
}

export default Builder;
