const baseUrl = 'http://localhost:3002';

describe('Logs Service', () => {
  test('GET /api/logs should return logs array', async () => {
    const response = await fetch(`${baseUrl}/api/logs`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });
});