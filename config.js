
const dotenv            = require('dotenv')
dotenv.config({ path: './.env' })

const config = {
    "publicPath": "./public",
    "email": process.env.TEST_MAIL,
    "sentryDSN": '',
    "sentryOptions": {
        debug: true,
        maxBreadcrumbs: 20,
        attachStacktrace: true
    },
    "database": {
        "type": "MongoDB",
        "host": process.env.DB_HOST,
        "port": process.env.DB_PORT,
        "credentials": {
            "username": process.env.DB_USERNAME,
            "password": process.env.DB_PASSWORD
        },
        "name": "HLM"
    },
    "serverPort": process.env.SERVER_PORT,
    "auth": {
        "enabled": true,
        "secret": process.env.AUTH_SECRET,
        "options": { 
            "expiresIn": "24h" 
        }
    },
    "bcrypt": {
        "saltRounds": 10 
    },
    "debug": {
        "extend": false
    },
    "module": {
        "useSignin":        true,
        "useRegister":      true,
        "useRights":        false
    }
}

module.exports = config;