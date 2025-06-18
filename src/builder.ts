import Configurator from "./configurator";

import { join, parse, normalize } from "path";
import fs, { existsSync, mkdirSync } from "fs";

const { config } = new Configurator();

const CATALOG_REGULAR_EXPRESSION = ["**", "?([\\w]+)?"] as const;
const FILE_REGULAR_EXPRESSION = ["*", "?(.+)"] as const;
const SPECIAL_SYMBOLS = [".", "/"] as const;

const createRegularExpression = (catalog: string, flags: string = "gi") => {
  let output = `${catalog}`;

  for (const specialSymbol of SPECIAL_SYMBOLS) {
    output = output.replaceAll(specialSymbol, "\\" + specialSymbol);
  };

  return new RegExp(output
    .replaceAll(...CATALOG_REGULAR_EXPRESSION)
    .replaceAll(...FILE_REGULAR_EXPRESSION),
    flags
  );
};

const resolve = (...paths: string[]) => normalize(join(...paths));

type Dirs = {
  [key: string]: {
    name: string,
    path: string,
  } & ({
    isDir: true,
    dirs: Dirs
  } | {
    isDir: false,
    dirs: null
  })
};

type RegExpFilterData = {
  ignore: RegExp[],
  includes: RegExp[],
  ignore_files: RegExp[]
};

const ROOT = "./" as const;

class DirManager {
  public constructor(
    public readonly dir: Dirs,
  ) {};

  public static resolve(path: string) {
    return ROOT + `${path}`.replaceAll("\\", "/");
  }

  public infinityParse(path: string, paths: string[] = []): string[] {
    const { dir } = parse(path);

    if (!dir) {
      return paths
    };
    
    paths.push(...this.infinityParse(dir));
    paths.push(dir);
    
    return paths;
  };

  public mapDirWithPath(dir: Dirs = this.dir) {
    const paths = (Object.values(dir).map(d =>
      d.isDir
        ? this.mapDirWithPath(d.dirs)
        : { path: d.path, dirs: parse(d.path).dir }
    ) as (string | string[])[]);

    return paths.flatMap((v) => v);
  };

  public mapDir(dir: Dirs = this.dir) {
    const paths = (Object.values(dir).map(d =>
      d.isDir
        ? this.mapDir(d.dirs)
        : d.path
    ) as (string | string[])[]);

    return paths.flatMap((v) => v);
  };

  public regularExpressionfilter(data: string[], regExps: RegExpFilterData["includes"]) {
    return data.filter(path => {
      if (regExps.filter(r => DirManager.resolve(path).match(r) !== null).length === 0) return false;
      
      return true;
    });
  };
}

class Builder {
  private readonly _build = resolve(ROOT, config.build);
  private readonly _reg_exp_filter_data: RegExpFilterData;

  public constructor() {
    this._reg_exp_filter_data = {
      ignore: config.ignore_catalogs.map(catalog => createRegularExpression(catalog)),
      ignore_files: config.ignore_files.map(file => createRegularExpression(file)),
      includes: config.catalogs.map(catalog => createRegularExpression(catalog))
    };
  }

  public execute() {

    this.CopyDirs(config.dirs);
    this.CopyFiles(config.source_files);
    this.CopyCatalogs();
  }

  private readonly CreateDir = (dirPath: string = this._build) => {
    if (!fs.existsSync(dirPath)) {
      console.log("creating dir...");

      fs.mkdirSync(dirPath);
    } else {
      console.log("cleaning dir...");

      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        if (!config.source_files.includes(file as any)) continue;

        fs.unlinkSync(resolve(dirPath, file));
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
      "copying " +
        "\u001B[33;1m" +
        parsed.name +
        parsed.ext +
        "\u001B[0m" +
        "..."
    );

    fs.copyFileSync(filePath, buildPath);
    console.log("copyied!");
  };

  private readonly CopyFiles = (files: string[]) => {
    this.CreateDir();

    for (const index in files) {
      const file = files[index];

      const filePath = resolve(config.source, file);
      const buildPath = config.build_files[index];

      this.CopyFile(filePath, resolve(config.build, buildPath));
    }
  };

  private readonly CopyDirs = (dirs: string[]) => {
    for (const dir of dirs) {
      if (Array.isArray(dir)) {
        let fullDir: string[] = [];

        for (const d of dir) {
          fullDir.push(d);
          this.CreateDir(resolve(this._build, ...fullDir));
        }
      } else this.CreateDir(resolve(this._build, dir));
    }
  };

  private readonly ReadDirsAndFiles = (dir: string, dirs: Dirs = {}) => {
		const resolvedPath = resolve(dir);
		const folder = fs.readdirSync(resolvedPath);

		for (const file of folder) {
      const path = resolve(resolvedPath, file);
      const pathToFilter = DirManager.resolve(path);
      const fileName = parse(path).name + parse(path).ext;

      const validated =
        this._reg_exp_filter_data.ignore.every(r => !(pathToFilter.match(r) && pathToFilter.match(r)![0] === pathToFilter))
        && this._reg_exp_filter_data.ignore_files.every(r => !(fileName.match(r) && fileName.match(r)![0] === fileName));
      
      if (!validated) continue;

      try {
				const folderPath = path;
				fs.readdirSync(folderPath);

				dirs[folderPath] = {
          name: file,
          path: folderPath,
          isDir: true,
          dirs: this.ReadDirsAndFiles(folderPath)
        };
			} catch (err) {
				dirs[file] = {
          name: file,
          path: path,
          isDir: false,
          dirs: null
        };
			}
		}

		return dirs;
  };

  private readonly ValidateCatalogs = () => {
    const dir = new DirManager(this.ReadDirsAndFiles(ROOT));

    return dir.regularExpressionfilter(dir.mapDir(), this._reg_exp_filter_data.includes);
  }

  private readonly CleanCatalogs = (catalogs: string[]) => {
    catalogs.forEach(catalog => {
      const fullPath: string[] = [];
      
      catalog.split("\\").forEach(path => {
        fullPath.push(path);
        
        const parsed = parse(resolve(...fullPath));
        console.log(
          "cleaning " +
          "\u001B[33;1m" +
          parsed.name +
          parsed.ext +
          "\u001B[0m" +
          "..."
        );

        try {
          if (fs.existsSync(resolve(this._build, ...fullPath))) {
            fs.unlinkSync(resolve(this._build, ...fullPath));
          }
        } catch {};
      })
    });
  };

  private readonly CreateDirs = (path: string) => {
    const dir = new DirManager(this.ReadDirsAndFiles(ROOT));

    dir.infinityParse(path, []).forEach(d => {
      if (!existsSync(resolve(this._build, d))) mkdirSync(resolve(this._build, d));
    });
  };

  private readonly CopyCatalog = (catalog: string) => {
    console.log(
      "resolving: " +
      "\u001B[33;1m" +
      catalog +
      "\u001B[0m" +
      "..."
    );

    
    fs.copyFileSync(resolve(catalog), resolve(this._build, catalog));
  };

  private readonly CopyCatalogs = () => {
    const catalogs = this.ValidateCatalogs();

    this.CleanCatalogs(catalogs);
    catalogs.forEach(catalog => {
      this.CreateDirs(catalog);
      this.CopyCatalog(catalog);
    });
  };
}

export default Builder;
