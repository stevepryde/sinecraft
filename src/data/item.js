const {
    db
} = require("./db");


const itemSchema = new db.Schema({
    name: {
        type: String,
        index: true
    },
    shortDesc: String,
    longDesc: String,
    subItems: [String], // Requires canContainItems attribute.
    attributes: [String],
    attributeStatus: { // Keys are attributes, values are strings containing attribute status.
        type: Map,
        of: String
    },
    weight: Number, //in Kg.
    health: Number,
    maxHealth: Number,
    hpModifier: Number
});

const Item = db.model('Item', itemSchema);
