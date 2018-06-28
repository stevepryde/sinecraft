const {
    AuthError,
    TokenInvalidError,
} = require("../auth/auth");

function authErrorHandler(res) {
    return (function (err) {
        if (err instanceof TokenInvalidError) {
            res.status(498);
            res.json({ code: err.message });
            return;
        }
        else if (err instanceof AuthError) {
            res.status(401);
            res.json({ code: err.message });
            return;
        }

        console.log("ERROR LOG");
        console.log(err);

        res.status(400);
        res.json({ code: "ERROR_UNKNOWN" });
    });
}


module.exports = {
    authErrorHandler
};
