import Configurator from "./configurator";

import { join, parse } from 'path';
import fs from 'fs';

const { config } = new Configurator();

class Builder {
    private readonly _build = join(__dirname, config.build);

    private readonly CreateDir = () => {
        if (!fs.existsSync(this._build)) {
            fs.mkdirSync(this._build);
        } else {
            const files = fs.readdirSync(this._build)

            for(const index in files) {
                const file = files[index];

                if (!config.fsource.includes(file)) continue;
                
                fs.unlinkSync(join(this._build, file));
            };
        };
    };

    private readonly CopyFile = (filePath: string, buildPath: string) => {
        if (!fs.existsSync(filePath))
            return;

        if (fs.existsSync(buildPath))
            fs.unlinkSync(buildPath);

        fs.copyFileSync(filePath, buildPath);
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

(() => {
    new Builder().execute();
})();

export default Builder;
