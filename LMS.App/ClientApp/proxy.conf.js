const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
  env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'http://localhost:48365';

const PROXY_CONFIG = [
  {
    context: [
      "/weatherforecast",
      "/bigBlueButton",
      "/auth",
      "/class",
      "/course",
      "/school",
      "/students",
      "/teachers",
      "/posts",
      "/users",
      "/userDashboard",
      "/stripe"
   ],
    target: target,
    secure: false,
    headers: {
      Connection: 'Keep-Alive'
    }
  }
]

module.exports = PROXY_CONFIG;
