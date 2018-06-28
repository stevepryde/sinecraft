/* Base command handler. */

class CommandHandler {
    constructor() {
    }

    async runCommand(baseCmd, params, player) {
        throw new Error("runCommand() not implemented!");
    }
}

module.exports = {
    CommandHandler
};
