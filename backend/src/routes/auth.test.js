const request = require('supertest');
const { app } = require('../index');
const { sequelize } = require('../models');

// We can use the agent to persist cookies between requests
const agent = request.agent(app);

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    const validUser = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should register a new user successfully and return a token', async () => {
      const res = await agent
        .post('/api/auth/register')
        .send(validUser);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toEqual(validUser.email);
    });

    it('should not allow registration with an existing email', async () => {
      // First, ensure the user from the previous test exists.
      // Then, attempt to register again with the same email.
      const res = await agent
        .post('/api/auth/register')
        .send(validUser);
      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('message', 'Email already registered');
    });

    it('should return an error for an invalid email', async () => {
      const res = await agent
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'password123' });
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors[0].msg).toEqual('Valid email is required');
    });

    it('should return an error for a short password', async () => {
      const res = await agent
        .post('/api/auth/register')
        .send({ email: 'another@example.com', password: 'short' });
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors[0].msg).toEqual('Password must be at least 8 characters');
    });
  });

  describe('POST /api/auth/login', () => {
    const validUser = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should log in a registered user successfully', async () => {
      const res = await agent
        .post('/api/auth/login')
        .send(validUser);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
    });

    it('should return an error for an incorrect password', async () => {
      const res = await agent
        .post('/api/auth/login')
        .send({ email: validUser.email, password: 'wrongpassword' });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return an error for a non-existent user', async () => {
      const res = await agent
        .post('/api/auth/login')
        .send({ email: 'nouser@example.com', password: 'password123' });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
});
