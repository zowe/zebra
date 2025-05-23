class MockDatabase {
    constructor(_, __, callback) {
        if (callback) callback(null);
    }
    run() {}
    get() {}
    all() {}
    close() {}
}

module.exports = {
    Database: MockDatabase,
    OPEN_READWRITE: 1,
};
