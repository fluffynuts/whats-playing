require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const setTokenCookie = require("./lib/set-token-cookie");


const app = express();
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());


const checkAuth = (req, res, next) => {
    if (!req.cookies.whatsPlayingToken) {
        req.user = null;
        if (req.url !== '/login') {
            return res.redirect('/login');
        }
    } else {
        const token = req.cookies.whatsPlayingToken;
        const decodedToken = jwt.decode(token, { complete: true }) || {};
        req.user = decodedToken.payload;
        // refresh token cookie -- user is authorized
        setTokenCookie(res, user);
    }

    next();
}

app.use(checkAuth);

app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    helpers: {
        ifEquals: function(arg1, arg2, options) {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        }
    }
}));
app.set('view engine', 'handlebars');

mongoose.connect(process.env.MONGODB_URI||'mongodb://localhost/whats-playing', { useNewUrlParser: true });

const PORT = process.env.PORT || 3000;

const song = require('./controllers/song.js');
const auth = require('./controllers/auth.js');
const user = require('./controllers/user.js')



song(app);
auth(app);
user(app);

app.listen(PORT, () => {
    console.log('Listening on port: ' + PORT);
})
