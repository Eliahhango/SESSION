const express = require('express');
const app = express();
const path = require('path');
const __path = process.cwd()
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;
let server = require('./eliahqr'),
    code = require('./pair');
require('events').EventEmitter.defaultMaxListeners = 500;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/eliahqr', server);
app.use('/code', code);
app.use('/pair',async (req, res, next) => {
res.sendFile(path.join(__path, 'pair.html'))
})
app.use('/',async (req, res, next) => {
res.sendFile(path.join(__path, 'eliahpage.html'))
})

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`\nDon't Forget To Give Star\n\n Server running on http://localhost:${PORT}`)
    })
}

module.exports = app
