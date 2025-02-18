const apn = require('apn');
require('dotenv').config();

function initializeAPN() {
  const apnProvider = new apn.Provider({
    cert: process.env.APN_CERT,
    key: process.env.APN_KEY,
    passphrase: process.env.APN_PASSPHRASE || '',
    production: true,
  });
  return { apn, apnProvider };
}

module.exports = initializeAPN;
