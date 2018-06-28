/* Central command router. */

const { CommandError } = require("./commandErrors");

class CommandRouter {
    constructor() {
        this.handlers = {

        };
    }

    on(cmd, handler) {
        this.handlers[cmd.toLowerCase()] = handler;
    }

    runCommand(cmd, player) {
        if (!cmd) {
            throw new CommandError("No command specified!");
        }

        var that = this;
        var params = cmd.split(" ");
        var baseCmd = params.shift();
        if (this.handlers.hasOwnProperty(baseCmd.toLowerCase())) {
            return new Promise(function (resolve, reject) {
                resolve(that.handlers[baseCmd.toLowerCase()](params, player));
            }).catch(function (err) {
                console.log(err);
                // All errors returned to client must be wrapped as a CommandError.
                throw new CommandError("Error processing command: " + err.message);
            });
        }
        else {
            if (baseCmd) {
                throw new CommandError("Unknown command: " + baseCmd);
            }
            else {
                throw new CommandError("Unrecognised command");
            }
        }
    }
}

// Singleton.
var cmdRouter = new CommandRouter();

module.exports = {
    cmdRouter
};
