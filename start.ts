import Configurator from "./configurator";
import Builder from "./builder";

if (process.env.NODE_ENV === "config") new Configurator();
else new Builder().execute();
