const db = require("mongoose");
db.connect("mongodb://localhost/sinecraft")
    .catch(function (err) {
        console.log(err.message);
        process.exit(1);
    });


module.exports = { db };
