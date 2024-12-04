export type Settings = string | string[] | string[][] | null;
export type SettingKeys = "dirs" | "fbuild" | "fsource" | "build" | "source";

export type Config = {
	[key: string]: Settings;

	dirs: string[] | string[][],
	fsource: string[] | string[][];
	fbuild: string[] | string[][];

	source: string;
	build: string;
};
