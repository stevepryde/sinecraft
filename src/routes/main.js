const express = require("express");
const {
    isAuthenticated
} = require("../auth/auth");
const router = express.Router();

router.get('/', function (req, res) {
    res.json({ message: "Hello World" });
});

router.get('/test', isAuthenticated, function (req, res) {
    res.json({ message: "TEST OK. User = " + req.user.username });
})

module.exports = router;
