const { app } = require('./app')
const port = process.env.PORT || 5000
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Listen on port ${port}`)
    })
}
