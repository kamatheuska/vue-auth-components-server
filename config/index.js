const env = process.env.NODE_ENV || 'development'
const config = require('./config.json')

if (env === 'development' || env === 'test') {
    const envConfig = config[env]
    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key]
    })
}
