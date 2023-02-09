const { createProxyMiddleware } = require('http-proxy-middleware');
//require('dotenv').config();
//const { SERVER_PORT } = process.env || 4354;
SERVER_PORT = 4354;

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: `http://localhost:${SERVER_PORT}`,
      changeOrigin: true,
    })
  );
};
