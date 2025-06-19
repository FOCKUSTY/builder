import Configurator from "./configurator";

import { parse } from "path";
import {
  existsSync,
  mkdirSync,
  copyFileSync,
  unlinkSync,
  readdirSync
} from "fs";

import {
  createRegularExpression,
  regularExpressionfilter,
  resolve,
  ROOT,
  toRoot,
  log
} from "./constants";

import { DirManager } from "./dir-manager";

import type { Dirs, RegExpFilterData } from "./config.types";

const { config } = new Configurator();

class Builder {
  private readonly _build = resolve(ROOT, config.build);
  private readonly _reg_exp_filter_data: RegExpFilterData;

  public constructor() {
    this._reg_exp_filter_data = {
      ignore: config.ignore_catalogs.map((catalog) =>
        createRegularExpression(catalog)
      ),
      ignore_files: config.ignore_files.map((file) =>
        createRegularExpression(file)
      ),
      includes: config.catalogs.map((catalog) =>
        createRegularExpression(catalog)
      )
    };
  }

  public execute() {
    this.CreateDir();

    this.CopyCatalogs();
    this.CopyDirs(config.dirs);
    this.CopyFiles(config.source_files);
  }

  private readonly CreateDir = (dirPath: string = this._build) => {
    if (!existsSync(dirPath)) {
      log("creating", "dir");

      mkdirSync(dirPath);
    } else {
      log("cleaning", "dir");

      const files = readdirSync(dirPath);
      for (const file of files) {
        if (!config.source_files.includes(file)) continue;

        unlinkSync(resolve(dirPath, file));
      }
    }
  };

  private readonly CopyFile = (filePath: string, buildPath: string) => {
    const parsed = parse(filePath);
    const builded = parse(buildPath);

    if (!existsSync(filePath)) return;
    if (existsSync(buildPath)) {
      log("deleting", builded.name + builded.ext);
      unlinkSync(buildPath);
    }

    log("copying", parsed.name + parsed.ext);

    try {
      readdirSync(filePath);
      mkdirSync(buildPath);
    } catch {
      copyFileSync(filePath, buildPath);
    }

    console.log("copyied!");
  };

  private readonly CopyFiles = (files: string[]) => {
    files.forEach((file, index) =>
      this.CopyFile(
        resolve(config.source, file),
        resolve(config.build, config.build_files[index])
      )
    );
  };

  private readonly CopyDirs = (dirs: string[]) => {
    dirs.forEach((dir) =>
      this.CreateDirs(
        resolve(this._build, ...(Array.isArray(dir) ? dir : [dir]))
      )
    );
  };

  private readonly IsPathValid = (path: string) => {
    const rootedPath = toRoot(path);
    const { name, ext } = parse(path);

    const catalogValided = this._reg_exp_filter_data.ignore.every((r) => {
      const matched = rootedPath.match(r);

      return !(Array.isArray(matched) ? matched[0] === rootedPath : false);
    });

    const fileValided = this._reg_exp_filter_data.ignore_files.every((r) => {
      const matched = name + ext.match(r);

      return !(Array.isArray(matched) ? matched[0] === name + ext : false);
    });

    return catalogValided && fileValided;
  };

  private readonly ReadDirsAndFiles = (dir: string, dirs: Dirs = {}) => {
    const resolvedPath = resolve(dir);
    const folder = readdirSync(resolvedPath);

    for (const file of folder) {
      const path = resolve(resolvedPath, file);

      if (!this.IsPathValid(path)) continue;

      try {
        readdirSync(path);

        dirs[path] = {
          name: file,
          path: path,
          isDir: true,
          dirs: this.ReadDirsAndFiles(path)
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

  private readonly FilterCatalogs = () => {
    const dir = new DirManager(this.ReadDirsAndFiles(ROOT));

    return regularExpressionfilter(
      dir.mapDir(),
      this._reg_exp_filter_data.includes
    );
  };

  private readonly CreateDirs = (path: string) => {
    const dir = new DirManager(this.ReadDirsAndFiles(ROOT));

    dir.infinityParse(path, []).forEach((d) => {
      if (!existsSync(resolve(this._build, d))) {
        mkdirSync(resolve(this._build, d));
      }
    });
  };

  private readonly CopyCatalogs = () => {
    const catalogs = this.FilterCatalogs();

    catalogs.forEach((catalog) => {
      this.CreateDirs(catalog);
      this.CopyFile(resolve(catalog), resolve(this._build, catalog));
    });
  };
}

export default Builder;
