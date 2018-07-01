/* Debug command handler */

const { cmdRouter } = require("./commandRouter");
const { createUser } = require("../auth/auth");

cmdRouter.on("/debugcmd requiredparam optionalparam?", function (params, player) {
    return "PARAMS: " + JSON.stringify(params);
});
