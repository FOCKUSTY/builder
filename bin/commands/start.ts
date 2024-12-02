import Builder from "../../builder";

class Command {
    public readonly execute = () => {
        new Builder().execute();
    };
};

export default Command;
