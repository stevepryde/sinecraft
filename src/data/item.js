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
    prefix: {
        type: String,
        default: "a"
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
    },
    room: {
        type: db.Schema.Types.ObjectId,
        ref: 'Room',
        required: false,
        index: true,
        default: null
    },
    player: {
        type: db.Schema.Types.ObjectId,
        ref: 'Player',
        required: false,
        index: true,
        default: null
    }

});

const Item = db.model('Item', itemSchema);

function itemCreate(name, playerId) {
    let item = {
        name: name,
        player: playerId,
        room: null
    };
    return new Item(item).save();
}

function itemDelete(_id) {
    return Item.findByIdAndRemove(_id).exec();
}

function itemList() {
    return Item.find().exec();
}

function getItemsInRoom(roomId) {
    return Item.find({ room: roomId }).exec();
}

function getItemsForPlayer(playerId) {
    return Item.find({ player: playerId }).exec();
}

function getItemById(_id) {
    return Item.findById(_id).exec();
}

function getItemByName(name) {
    return Item.findOne({ name: name }).exec();
}

function getPlayerItemByName(playerId, name) {
    return Item.findOne({ player: playerId, name: name }).exec();
}

function getRoomItemByName(roomId, name) {
    return Item.findOne({ room: roomId, name: name }).exec();
}

function updateItem(item) {
    return Item.findByIdAndUpdate(item._id, item).exec();
}

function getItemName(item) {
    return [item.prefix, item.name].join(" ");
}

function addItemAttribute(item, attr) {
    if (item.attributes.indexOf(attr) >= 0) {
        return item; // Nothing to do.
    }

    item.attributes.push(attr);
    return updateItem(item);
}

function delItemAttribute(item, attr) {
    let index = item.attributes.indexOf(attr);

    if (index < 0) {
        return item; // Nothing to do.
    }

    item.attributes.splice(index, 1);
    return updateItem(item);
}


module.exports = {
    addItemAttribute,
    delItemAttribute,
    getItemById,
    getItemByName,
    getItemName,
    getItemsForPlayer,
    getItemsInRoom,
    getPlayerItemByName,
    getRoomItemByName,
    Item,
    itemCreate,
    itemDelete,
    itemList,
    updateItem
};
