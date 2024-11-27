export type Settings = string | string[] | null;
export type SettingKeys = "fbuild"|"fsource"|"build"|"source";

export type Config = {
    [key: string]: Settings,

    fsource: string[],
    fbuild: string[],
    
    source: string,
    build: string
}