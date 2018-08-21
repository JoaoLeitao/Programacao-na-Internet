const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser')
const hbs = require('hbs')
const cookieParser = require('cookie-parser');
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')

const commetRouter = require('./routes/commentRoutes')
const userRouter = require('./routes/userRoutes')
const listRouter = require('./routes/listRoutes')
const movieRouter = require('./routes/movieRoutes');

const app = express();
const app_port = process.env.app_port || 8080
app.listen(app_port, ()=> console.log('App listening to port 13114!'))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials')

// --------------- HELPERS
hbs.registerHelper('hasPage', function(page, value, opts) {
    const pageNumber = parseInt(page)
    const valueNumber = parseInt(value)
    return pageNumber === valueNumber ? '' : opts.fn(this)
})

hbs.registerHelper('inc', function(page, max_pages){
    const toReturn = parseInt(page)+1
    return toReturn > max_pages ? max_pages : toReturn
})

hbs.registerHelper('dec', function(page){
    const toReturn = parseInt(page)-1
    return toReturn === 0 ? 1 : toReturn;
})
//-------------- END HELPERS

app.use(bodyParser.urlencoded({ extended: false }));
app.use(favicon(path.join(__dirname, 'public/images', 'logo.jpg')))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser());
app.use(session({secret: 'keyboard cat', resave: false, saveUninitialized: true}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

app.use(commetRouter)
app.use(movieRouter)
app.use(userRouter)

//check if a user is logged in
app.use(function (req, res, next) {
    if(req.user) return next()
    res.redirect('/login')
})

app.use(listRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found! Sorry');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  let user;
  if (req.user)
      user = {username: req.user.username}
  res.render('errorView', user);
});

module.exports = app;