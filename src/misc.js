// Misc functions.

function formatList(l) {
    if (!l) {
        return "";
    }

    if (l.length === 1) {
        return l[0];
    }

    let last = l.pop();
    return l.join(", ") + " and " + last;
}

module.exports = {
    formatList
};
