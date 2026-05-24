const baseUrl = 'http://localhost:3000';

describe('Users Service', () => {
  test('GET /api/users should return users array', async () => {
    const response = await fetch(`${baseUrl}/api/users`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  test('GET /api/users/123123 should return user details', async () => {
    const response = await fetch(`${baseUrl}/api/users/123123`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('first_name');
    expect(data).toHaveProperty('last_name');
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('total');
  });

  test('POST /api/add duplicate user should return error', async () => {
    const response = await fetch(`${baseUrl}/api/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 123123,
        first_name: 'mosh',
        last_name: 'israeli',
        birthday: '2001-01-01'
      })
    });

    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('message');
  });
});