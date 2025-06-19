export const SETTINGS_KEYS = [
  "dirs",
  "catalogs",
  "ignore_catalogs",
  "ignore_files",
  "build_files",
  "source_files",
  "build",
  "source"
] as const;

export type SettingKeys = (typeof SETTINGS_KEYS)[number];
export type Settings = string | string[] | null;

export type InputSettings = Settings | string[][];
export type StandartSettings = Exclude<Settings, null>;

export type OldConfigType = {
  catalogs: string[];
  ignore_catalogs: string[];
  ignore_files: string[];

  dirs: string[];

  build_files: string[];
  source_files: string[];

  build: string;
  source: string;
};

export type Config<T> = Record<SettingKeys, T>;

export type InputConfig = Config<InputSettings>;
export type StandartConfig = Config<StandartSettings>;

export type Dirs = {
  [key: string]: {
    name: string;
    path: string;
  } & (
    | {
        isDir: true;
        dirs: Dirs;
      }
    | {
        isDir: false;
        dirs: null;
      }
  );
};

export type RegExpFilterData = {
  ignore: RegExp[];
  includes: RegExp[];
  ignore_files: RegExp[];
};
