import Configurator from "../../configurator";

class Command {
    public readonly execute = () => {
        new Configurator(true);
    };
};

export default Command;
