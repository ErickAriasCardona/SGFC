require('dotenv').config();

module.exports = {
    googleClientId: process.env.CLIENT_ID,
    port: process.env.PORT || 3001,
};