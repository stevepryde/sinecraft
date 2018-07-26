// Misc functions.

const Attributes = {
    canPickUp: "canPickUp"
};

function formatList(l) {
    if (!l || l.length === 0) {
        return "nothing";
    }

    if (l.length === 1) {
        return l[0];
    }

    let last = l.pop();
    return l.join(", ") + " and " + last;
}

function hasAttribute(item, attr) {
    return item.attributes.indexOf(attr) >= 0;
}

module.exports = {
    Attributes,
    formatList,
    hasAttribute
};
