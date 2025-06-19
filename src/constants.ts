import { join, normalize } from "path";
import { RegExpFilterData } from "./config.types";

export const ROOT = "./" as const;

export const CATALOG_REGULAR_EXPRESSION = ["**", "?([\\w]+)?"] as const;
export const FILE_REGULAR_EXPRESSION = ["*", "?(.+)"] as const;
export const SPECIAL_SYMBOLS = [".", "/"] as const;
export const SLASH_REPLACER = [ "\\", "/" ] as const;

export const createRegularExpression = (catalog: string, flags: string = "gi") => {
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

export const resolve = (...paths: string[]) => normalize(join(...paths));

export const toRoot = (path: string) => {
  return ROOT + `${path}`.replaceAll(...SLASH_REPLACER);
};

export const regularExpressionfilter = (data: string[], regExps: RegExpFilterData["includes"]) => {
  return data.filter(path => {
    if (regExps.filter(r => toRoot(path).match(r) !== null).length === 0) return false;
    
    return true;
  });
};

export const log = (action: string, name: string) => {
  console.log(
    action +
    " \u001B[33;1m" +
    name +
    "\u001B[0m" +
    "..."
  );
};