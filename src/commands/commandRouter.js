/* Central command router. */

const { CommandError, UsageError } = require("./commandErrors");

class CommandRouter {
    constructor() {
        this.handlers = {};
        this.usage = {};
    }

    on(cmd, handler) {
        // Parse the command spec.
        var parts = cmd.split(" ");
        var baseCmd = parts.shift().toLowerCase();
        this.handlers[baseCmd] = handler;
        this.usage[baseCmd] = parts;

        // This will validate the usage spec and throw an exception if invalid.
        this.parseParamSpec(baseCmd);
    }

    runCommand(cmd, player) {
        var that = this;
        return new Promise(function (resolve, reject) {
            if (!cmd) {
                reject(new Error("No command specified!"));
                return;
            }

            var { baseCmd, outParams } = that.parseCommand(cmd);
            if (that.handlers.hasOwnProperty(baseCmd)) {
                var params = that.getParams(baseCmd, outParams);
                resolve(that.handlers[baseCmd](params, player));
            }
            else {
                if (baseCmd) {
                    reject(new CommandError("Unknown command: " + baseCmd));
                }
                else {
                    reject(new CommandError("Unrecognised command"));
                }
            }
        });
    }

    parseCommand(cmd) {
        var rawParams = cmd.split(" ");
        var baseCmd = rawParams.shift().toLowerCase();

        var token;
        var curParam = '';
        var quoteFlag = false;
        var outParams = [];
        for (let param of rawParams) {
            let chars = param.split('');
            for (let c of chars) {
                if (quoteFlag) {
                    curParam += c;
                    quoteFlag = false;
                    continue;
                }

                if (c === '\\') {
                    quoteFlag = true;
                    continue;
                }

                if (c === '"' || c === "'") {
                    // Start token.
                    if (!token) {
                        token = c;
                        continue;
                    }

                    // Other token.
                    if (token !== c) {
                        curParam += c;
                        continue;
                    }

                    // End token.
                    if (curParam.length > 0) {
                        outParams.push(curParam);
                    }

                    curParam = '';
                    token = null;
                    continue;
                }

                curParam += c;
            }

            if (token) {
                curParam += " ";
            }
            else if (curParam.length > 0) {
                outParams.push(curParam);
                curParam = '';
            }
        }

        if (curParam.length > 0) {
            outParams.push(curParam);
            curParam = '';
        }

        console.log(outParams);

        return {
            baseCmd,
            outParams
        };
    }

    parseParamSpec(baseCmd) {
        var usage = this.usage[baseCmd];
        if (!usage) {
            usage = [];
        }

        var required = [];
        var optional = [];
        var usageList = [];
        for (let part of usage) {
            usageList.push("<" + part + ">");
            if (part.slice(-1) === "?") {
                optional.push(part.slice(0, -1));
            }
            else {
                if (optional.length > 0) {
                    throw new Error("Command '" + baseCmd + "' is broken. Required params after optional ones?!");
                }

                required.push(part);
            }
        }

        return {
            required,
            optional,
            usageStr: baseCmd + " " + usageList.join(" ")
        };
    }

    getParams(baseCmd, params) {
        var { required, optional, usageStr } = this.parseParamSpec(baseCmd);
        console.log(params);
        console.log("last param is '" + params[-1] + "'");

        if ((params[params.length - 1] === "help") ||
            (params.length < required.length) ||
            (params.length > (required.length + optional.length))) {

            throw new UsageError(usageStr);
        }

        // Populate params object to return.
        var obj = {}
        required.concat(optional).forEach(function (value, i) {
            if (i < params.length) {
                obj[value] = params[i];
            }
            else {
                obj[value] = null;
            }
        });

        return obj;
    }
}


// Singleton.
var cmdRouter = new CommandRouter();

module.exports = {
    cmdRouter
};
