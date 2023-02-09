// Database configuration data
module.exports = {
    database: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      db: process.env.DB_NAME,
      user: process.env.DB_USER
    }
  };