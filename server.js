if (process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const articleRouter = require('./routes/articles');
const userRouter = require('./routes/user');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

// Models
const Article = require('./models/article');

const app = express();

mongoose.connect('mongodb://localhost/markdown-blogger', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.get('/', async (req, res) => {
  const articles = await Article.find().sort({ createdAt: 'desc' });

  res.render('articles/index', { articles: articles });
});

app.get('/new', (req, res) => {
  res.send('Create new article here');
});

app.use('/articles', articleRouter);
app.use('/user', userRouter);

app.listen(3000);
