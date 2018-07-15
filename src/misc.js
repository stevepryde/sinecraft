// Misc functions.

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

module.exports = {
    formatList
};
