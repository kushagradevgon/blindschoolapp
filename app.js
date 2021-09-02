const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
require('./db/conn.js');
app.use(require('./routes/router.js'));
console.log(process.env.PORT)

app.listen(process.env.PORT)