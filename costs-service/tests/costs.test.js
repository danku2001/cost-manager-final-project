const baseUrl = 'http://localhost:3001';

describe('Costs Service', () => {
  test('POST /api/add should add new cost', async () => {
    const response = await fetch(`${baseUrl}/api/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userid: 123123,
        description: 'burger',
        category: 'food',
        sum: 30
      })
    });

    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('description');
  });

  test('GET /api/report should return report', async () => {
    const response = await fetch(
      `${baseUrl}/api/report?id=123123&year=2026&month=5`
    );

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('userid');
    expect(data).toHaveProperty('costs');
  });
});