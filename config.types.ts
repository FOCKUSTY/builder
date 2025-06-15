export type SettingKeys = "dirs" | "fbuild" | "fsource" | "build" | "source";
export type Settings = string | string[] | null;

export type InputSettings = Settings | string[][];
export type StandartSettings = Exclude<Settings, null>;

export type OldConfigType = {
  dirs: string[];

  fbuild: string[];
  fsource: string[];

  build: string;
  source: string;
};

export type Config<T> = Record<SettingKeys, T>;

export type InputConfig = Config<InputSettings>;
export type StandartConfig = Config<StandartSettings>;
