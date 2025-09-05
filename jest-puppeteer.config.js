module.exports = {
  launch: {
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
  server: {
    command: 'http-server dist',
    port: 8080,
  },
};
