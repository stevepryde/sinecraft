/* Admin command handler */

const { cmdRouter } = require("./commandRouter");
const { createUser } = require("../auth/auth");

cmdRouter.on("/adduser username password displayName?", function (params, player) {
    var displayName = params.displayName || params.username;
    var username = params.username;
    var password = params.password;
    return createUser({
        username: username,
        password: password,
        displayName: displayName
    }).then(function (user) {
        return "User '" + username + "' created successfully";
    }).catch(function (err) {
        return "Error adding user: " + err.message;
    })
});
