import { parse } from "path";

import type { Dirs } from "./config.types";

export class DirManager {
  public constructor(public readonly dir: Dirs) {}

  public infinityParse(path: string, paths: string[] = []): string[] {
    const { dir } = parse(path);

    if (!dir) {
      return paths;
    }

    paths.push(...this.infinityParse(dir));
    paths.push(dir);

    return paths;
  }

  public mapDirWithPath(dir: Dirs = this.dir) {
    const paths = Object.values(dir).map((d) =>
      d.isDir
        ? this.mapDirWithPath(d.dirs)
        : { path: d.path, dirs: parse(d.path).dir }
    ) as (string | string[])[];

    return paths.flatMap((v) => v);
  }

  public mapDir(dir: Dirs = this.dir) {
    const paths = Object.values(dir).map((d) =>
      d.isDir ? this.mapDir(d.dirs) : d.path
    ) as (string | string[])[];

    return paths.flatMap((v) => v);
  }
}

export default DirManager;
