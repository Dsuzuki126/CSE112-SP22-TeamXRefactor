// jest-puppeteer.config.js

module.exports = {
    launch: {
      headless: false,
      slowMo: 100,
      args: ["--no-sandbox", "disable-setuid-sandbox"]
    }
  }
