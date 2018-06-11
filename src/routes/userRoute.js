const express = require("express");
const {
    AuthError,
    isAuthenticated,
    TokenInvalidError
} = require("../auth/auth");
const {
    User
} = require("../data/users");


const router = express.Router();

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

router.get('/me', isAuthenticated, function (req, res) {
    // WARNING: NEVER send the entire user object to the client.
    res.json({
        username: req.user.username,
        displayName: req.user.displayName
    });
});



module.exports = router;
