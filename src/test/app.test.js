jest.mock('sqlite3');

const request = require('supertest');
const app = require('../app'); // assuming this resolves to src/app.js

describe('GET /about', () => {
    it('should return 200 OK', async () => {
        const res = await request(app).get('/about');
        expect(res.statusCode).toBe(200);
    });
});

module.exports = app;
