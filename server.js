/* Import packages
-------------------------------------------------- */
const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const bcrypt = require('bcrypt')

/* Import DBs
-------------------------------------------------- */
const User = require('./models/users.js')
const Post = require('./models/posts.js');

/* Create and configure Express app 
-------------------------------------------------- */
// initialize the express app from the express package
const app = express();
// configure express to use EJS and look in the "views" folder
app.set('view engine', 'ejs');

const path = require('path'); // Ensure 'path' is required for path operations
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname)]); // tell express to look for views in root and views folder

// Set the port from environment variable or default to 3000
const port = process.env.PORT ? process.env.PORT : '3000';


// connect to MongoDB Atlas with mongoose
mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB Atlas at ${mongoose.connection.name}`);
});

// import controllers
const feedController = require('./controllers/feed.js')
const profileController = require('./controllers/profile.js')
const communityController = require('./controllers/community.js')


/* Middleware
-------------------------------------------------- */

const isSignedIn = require('./middleware/is-signed-in.js');
const passUserToView = require('./middleware/pass-user-to-view.js');

// Detect if running in a dev environment
if (process.env.ON_HEROKU === 'false') {
  app.use(morgan('dev'))
}

// Used to parse request bodies from PUT/PATCH/POST requests
app.use(express.urlencoded({ extended: false }))
// Allow HTML forms to send PUT/DELETE requests instead of just GET or POST

app.use(methodOverride('_method'))
// Set up session management
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}))
// adding user object (if it exists) from the session to res.locals
app.use(passUserToView)

app.use(express.static('public'))

/* Routes
-------------------------------------------------- */

// Render homepage
app.get('/',(req,res) => {
  res.render('index')
})

// Render signup page
app.get('/signup',(req,res) => {
  res.render('../views/auth/sign-up')
})

// Create new accounts
app.post('/signup/create',async (req,res)=>{
  
  // check if username available
  const checkUsername = await User.findOne({username: req.body.username})
  if (checkUsername) {
    return res.send('Username is already taken')
  } 

  // check if password matches confirmed password
  if (req.body.password !== req.body.confirmPassword) {
    return res.send('Password and confirm password must match')
  }

  // if username is availble and passwords match, then hash pw and create user in collection
  const hashedPassword = await bcrypt.hashSync(req.body.password,10)
  await User.create({
    username: req.body.username,
    password: hashedPassword,
    author: req.body.author,
    city: req.body.city,
    state: req.body.state,
    profilePhotoUrl: req.body.profilePhotoUrl,

  })
  res.redirect('/')
})

// Allow users to sign in
app.post('/', async (req,res) => { 
  // check if username exists
  // if the user name exists, then check the password
  
  const checkUsername = await User.findOne({username: req.body.username})
  if (checkUsername) {
    const validPassword = bcrypt.compareSync(
      req.body.password,
      checkUsername.password
    )
    if (!validPassword){
      return res.send('Login failed -- invalid password')
    } else { // SUCCESSFUL LOGIN
      // There is a user AND they had the correct password. Time to make a session!
      // Avoid storing the password, even in hashed format, in the session
      // If there is other data you want to save to `req.session.user`, do so here!
      req.session.user = {
        username: checkUsername.username,
        author: checkUsername.author,
        _id: checkUsername._id,
      };
      res.redirect('/feed')
    }
  } else {
    res.send('Invalid username - please try again')
  }
})




app.get('/sign-out', (req,res) => {
  req.session.destroy()
  res.redirect('/')
})

app.use('/feed',feedController)
app.use('/profile',profileController)
app.use('/community',communityController)



app.listen(port,function() {
  console.log('Express app running on port ' + port)
})
