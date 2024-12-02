import Configurator from "./configurator";

import { join, parse } from 'path';
import fs from 'fs';

const { config } = new Configurator();

class Builder {
    private readonly _build = join(__dirname, config.build);

    private readonly CreateDir = () => {
        if (!fs.existsSync(this._build)) {
            console.log("creating dir...");

            fs.mkdirSync(this._build);
        } else {
            console.log("cleaning dir...");

            const files = fs.readdirSync(this._build);

            for(const index in files) {
                const file = files[index];

                if (!config.fsource.includes(file)) continue;
                
                fs.unlinkSync(join(this._build, file));
            };
        };
    };

    private readonly CopyFile = (filePath: string, buildPath: string) => {
        const parsed = parse(filePath);
        const builded = parse(buildPath);

        if (!fs.existsSync(filePath))
            return;

        if (fs.existsSync(buildPath)) {
            console.log("deleting " + "\u001B[33;1m" + builded.name + builded.ext + "\u001B[0m" + "...");
            fs.unlinkSync(buildPath);
        }

        console.log("copying " + "\u001B[33;1m" + parsed.name + parsed.ext + "\u001B[0m" + "...");

        fs.copyFileSync(filePath, buildPath);
        console.log("copyied!");
    };

    private readonly CopyFiles = (files: string[]) => {
        this.CreateDir();

        for(const index in files) {
            const filePath = join(config.source, files[index]);
            const buildPath = join(config.build, config.fbuild[index]);

            this.CopyFile(filePath, buildPath);
        };
    };

    public execute() {
        this.CopyFiles(config.fsource);
    };
}

export default Builder;
