const { sequelize } = require('../src/models');

beforeAll(async () => {
  // This will drop all tables and recreate them.
  // It's perfect for ensuring a clean state for our tests.
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Gracefully close the database connection after all tests have run.
  await sequelize.close();
});
