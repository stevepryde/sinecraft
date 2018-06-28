const express = require("express");
const {
    AuthError,
    isAuthenticated,
    TokenInvalidError
} = require("../auth/auth");
const {
    User
} = require("../data/users");

const {
    authErrorHandler
} = require("./errors");

const router = express.Router();

router.get('/me', isAuthenticated, function (req, res) {
    // WARNING: NEVER send the entire user object to the client.
    res.json({
        username: req.user.username,
        displayName: req.user.displayName
    });
});



module.exports = router;
