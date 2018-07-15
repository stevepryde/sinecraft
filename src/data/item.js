const {
    db
} = require("./db");


const itemSchema = new db.Schema({
    name: {
        type: String,
        index: true
    },
    shortDesc: {
        type: String,
        default: ''
    },
    longDesc: {
        type: String,
        default: ''
    },
    subItems: [db.Schema.Types.ObjectId], // Array of ids. Requires canContainItems attribute.
    attributes: [String],
    attributeStatus: Object, // Object mapping attributes to state strings.
    metadata: Object, // Object containing metadata.
    weight: {
        type: Number, //in Kg.
        default: 1
    },
    health: {
        type: Number,
        default: 100
    },
    maxHealth: {
        type: Number,
        default: 100
    },
    hpModifier: {
        type: Number,
        default: 10
    }
});

const Item = db.model('Item', itemSchema);

module.exports = {
    Item
};
