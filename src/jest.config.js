module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/test/**/*.test.js'],
    testPathIgnorePatterns: ['/node_modules/'],
    moduleDirectories: ['node_modules'],
    coverageDirectory: 'coverage',
    collectCoverage: true,
};
