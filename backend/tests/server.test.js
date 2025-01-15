const request = require('supertest');
const { app, server, supabase, mailerSend } = require('../server'); // Adjust the path to your server file

afterAll(() => {
  server.close(); // Close the server after all tests
});

describe('GET /', () => {
  it('should return Hello World', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('Testing, Hello World!');
  });
});

describe('POST /send-reset-email', () => {
  it('should return 404 if email not found', async () => {
    const res = await request(app).post('/send-reset-email').send({ email: 'nonexistent@example.com' });
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toBe('Email not found');
  });

  it('should return 500 if there is an error querying the database', async () => {
    // Simulate an error in Supabase query
    const spy = jest.spyOn(supabase.from('users'), 'select').mockImplementation(() => ({
      eq: () => ({
        maybeSingle: async () => ({ error: { message: 'Database error' } })
      })
    }));

    const res = await request(app).post('/send-reset-email').send({ email: 'test@example.com' });
    expect(res.statusCode).toEqual(500);
    expect(res.body.message).toBe('Failed to send reset email');

    spy.mockRestore();
  });

  it('should send reset email successfully', async () => {
    // Mock Supabase response
    const spy = jest.spyOn(supabase.from('users'), 'select').mockImplementation(() => ({
      eq: () => ({
        maybeSingle: async () => ({ data: { id: 1 } })
      })
    }));

    // Mock MailerSend response
    jest.spyOn(mailerSend.email, 'send').mockImplementation(async () => ({ success: true }));

    const res = await request(app).post('/send-reset-email').send({ email: 'test@example.com' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Reset email sent successfully');

    spy.mockRestore();
    jest.restoreAllMocks();
  });
});

describe('POST /send-feedback', () => {
  it('should send feedback successfully', async () => {
    // Mock MailerSend response
    jest.spyOn(mailerSend.email, 'send').mockImplementation(async () => ({ success: true }));

    const res = await request(app).post('/send-feedback').send({ feedback: 'This is a test feedback' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Feedback sent successfully');

    jest.restoreAllMocks();
  });

  it('should return 500 if there is an error sending feedback', async () => {
    // Simulate an error in MailerSend
    jest.spyOn(mailerSend.email, 'send').mockImplementation(async () => {
      throw new Error('Email sending error');
    });

    const res = await request(app).post('/send-feedback').send({ feedback: 'This is a test feedback' });
    expect(res.statusCode).toEqual(500);
    expect(res.body.message).toBe('Failed to send feedback');

    jest.restoreAllMocks();
  });
});
