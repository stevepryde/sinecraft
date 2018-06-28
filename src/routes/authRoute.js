const express = require("express");
const {
    AuthError,
    authUser,
    createUser,
    isAuthenticated,
    logoutUser,
    refreshAuth,
    TokenInvalidError,
    updatepw
} = require("../auth/auth");

const {
    authErrorHandler
} = require("./errors");


const router = express.Router();



router.post('/login', function (req, res) {
    authUser(req.body.username, req.body.password)
        .then(function (data) {
            res.json({
                authToken: data.authToken,
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

// // Disabled: Only create users via admin commands from now on.
// router.post('/create', function (req, res) {
//     createUser(req.body)
//         .then(function (data) {
//             res.json({
//                 authToken: data.authToken,
//                 refreshToken: data.refreshToken
//             });
//         })
//         .catch(authErrorHandler(res));
// });

router.post('/pw', isAuthenticated, function (req, res) {
    updatepw(req.user.username, req.body.password, req.body.newPassword)
        .then(function (data) {
            res.json({
                authToken: data.authToken,
                refreshToken: data.refreshToken
            });
        })
        .catch(authErrorHandler(res));
});

router.post('/refresh', function (req, res) {
    refreshAuth(req.body.authToken, req.body.refreshToken)
        .then(function (data) {
            res.json({
                authToken: data.authToken,
                refreshToken: data.refreshToken
            });
        })
        .catch(authErrorHandler(res));
});


module.exports = router;
