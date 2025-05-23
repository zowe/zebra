jest.mock('sqlite3');


const request = require('supertest');
const app = require('../app'); // This should come after mocks

describe('Route Tests', () => {
    it('GET / should return 200 OK', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('ZEBRA');
    });

    it('GET /about should return 200 OK', async () => {
        const res = await request(app).get('/about');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('About ZEBRA');
    });

    it('GET /login should return 200 OK and render login page', async () => {
        const res = await request(app).get('/log_in');
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/login/i);
    });


    it('GET /metrics should return 302 and redirect to login', async () => {
        const res = await request(app).get('/metrics');
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/log_in');
    });

    // it('POST /login with valid credentials should redirect (302)', async () => {
    //     const res = await request(app)
    //         .post('/log_in')
    //         .send({ username: 'testuser', password: 'testpass' });
    //     expect(res.statusCode).toBe(302);
    //     expect(res.headers.location).toBe('/');
    // });
    //
    //
    // it('should login and access /metrics with metrics content', async () => {
    //     const agent = request.agent(app);
    //
    //     await agent
    //         .post('/log_in')
    //         .send({ username: 'testuser', password: 'testpass' })
    //         .expect(302);
    //
    //     const metricsRes = await agent.get('/metrics');
    //     expect(metricsRes.statusCode).toBe(200);
    //     expect(metricsRes.text).toContain('#');
    // });
});
