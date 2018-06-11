const express = require("express");
const {
    AuthError,
    authUser,
    createUser,
    isAuthenticated,
    logoutUser,
    refreshAuth,
    TokenInvalidError
} = require("../auth/auth");


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

router.post('/login', function (req, res) {
    authUser(req.body.username, req.body.password)
        .then(function (data) {
            res.json({
                authToken: data.token,
                refreshToken: data.refreshToken
            });
        })
        .catch(authErrorHandler(res));
});

router.post('/logout', isAuthenticated, function (req, res) {
    logoutUser(req.user._id)
        .then(function () {
            res.json({ code: "LOGOUT_SUCCESSFUL" });
        })
        .catch(authErrorHandler(res));
});

router.post('/create', function (req, res) {
    createUser(req.body)
        .then(function (data) {
            res.json({
                authToken: data.token,
                refreshToken: data.refreshToken
            });
        })
        .catch(authErrorHandler(res));
});

router.post('/refresh', function (req, res) {
    refreshAuth(req.body.authToken, req.body.refreshToken)
        .then(function (data) {
            res.json({
                authToken: data.token,
                refreshToken: data.refreshToken
            });
        })
        .catch(authErrorHandler(res));
});


module.exports = router;
