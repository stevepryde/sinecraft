const express = require("express");
const {
    isAuthenticated
} = require("../auth/auth");
const {
    authErrorHandler
} = require("./errors");
const { cmdRouter } = require("../commands/commandRouter");
const { CommandError, UsageError } = require("../commands/commandErrors");
require("../commands/admin");
require("../commands/debug");

const router = express.Router();
router.get('/', function (req, res) {
    res.json({ message: "Hello World" });
});

router.get('/test', isAuthenticated, function (req, res) {
    res.json({ message: "TEST OK. User = " + req.user.username });
});

router.post('/cmd', isAuthenticated, function (req, res) {
    cmdRouter.runCommand(req.body.cmd, req.player)
        .then(function (news) {
            res.status(200);
            res.json({ message: news });
            return;
        })
        .catch(function (err) {
            res.status(200);

            if (err instanceof UsageError) {
                res.json({ message: "Usage: " + err.message });
            }
            else if (err instanceof CommandError) {
                res.json({ message: "Error: " + err.message });
            }
            else {
                res.json({ message: "ERR: " + err });
                // res.json({ message: "An error occurred. Have you tried turning it off and on again?" });
            }
        });
});

module.exports = router;
