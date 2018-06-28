const {
    db
} = require("./db");


const roomSchema = new db.Schema({
    name: {
        type: String,
        index: true,
        unique: true
    },
    shortDesc: String,
    longDesc: String,
    items: [{
        itemId: String,
        location: String
    }],
    exits: [{
        name: String,
        roomId: String
    }]
});

const Room = db.model('Room', roomSchema);
