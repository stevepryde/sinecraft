/* Admin command handler */

const { cmdRouter } = require("./commandRouter");
const { createUser } = require("../auth/auth");

cmdRouter.on("/adduser", function (params, player) {
    var displayName = params.length > 2 ? params[2] : params[0];
    var username = params[0];
    return createUser({
        username: username,
        password: params[1],
        displayName: params[2]
    }).then(function (user) {
        return "User '" + username + "' created successfully";
    });
});
