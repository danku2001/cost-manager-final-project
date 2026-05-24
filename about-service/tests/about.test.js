const baseUrl = 'http://localhost:3003';

describe('About Service', () => {
  test('GET /api/about should return developer details', async () => {
    const response = await fetch(`${baseUrl}/api/about`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });
});