const logItem = (item, type) => {
    if (type === 'success') {
        console.log(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}] ${item}`)
    } else {
        console.error(`[${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}] ERROR: ${item}`)
    }
};

module.exports = logItem;

