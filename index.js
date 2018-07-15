const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const winston = require("winston");
const expressWinston = require("express-winston");

const mainRoutes = require("./src/routes/main");
const authRoutes = require("./src/routes/authRoute");
const userRoutes = require("./src/routes/userRoute");

const {
    createAdminUser
} = require("./src/auth/auth");
const {
    Room,
    roomCreate
} = require("./src/data/room");
const {
    User
} = require("./src/data/users");

console.log("Sinecraft Server is starting...");

Room.count(function (err, count) {
    if (!err && count === 0) {
        console.log("No rooms. Adding default room: 'lobby'...");
        roomCreate("lobby")
            .catch(function (err) {
                console.log("Error creating lobby: " + err);
                process.exit();
            });
    }
});

User.count(function (err, count) {
    if (!err && count === 0) {
        // Add admin user.
        console.log("No users. Adding default admin user...");
        createAdminUser({
            username: 'admin',
            password: 'sinecraft123'
        }).then(function (details) {
            console.log("Admin user created successfully");
            console.log("Username: admin");
            console.log("Password: sinecraft123");
            console.log("Login using the client and change the password");
        }).catch(function (err) {
            console.log("Error adding admin user! " + err);
            process.exit();
        });
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console({
            json: false,
            colorize: true
        })
    ],
    meta: false, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
}));

app.use('/game', mainRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);


var server = app.listen(5000, function () {
    console.log("Server running on port:", server.address().port);
});
