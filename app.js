const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const mongoose = require('mongoose')
const passport = require('passport')
const session = require('express-session')
const exphbs = require('express-handlebars')
const MongoStore = require('connect-mongo')(session)
const connectDB = require('./config/db')

//Load Config
dotenv.config({path : './config/config.env' })

//Passport Config
require('./config/passport')(passport)

connectDB()

const app = express()

//Body Parser
app.use(express.urlencoded({extended:false}))
app.use(express.json())
//Logging
if(process.env.NODE_ENV == 'development'){
    app.use(morgan('dev'))
}

//Handlebars Helpers
const {formatDate,stripTags,truncate,editIcon} = require('./helpers/hbs')

//Handlebers
app.engine('.hbs', exphbs({ helpers:{formatDate,truncate,stripTags,editIcon},defaultLayout:'main' ,extname: '.hbs'}));
app.set('view engine', '.hbs');

//Sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection : mongoose.connection })
    
  }))

//Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

// Set Global Variable
app.use((req,res,next)=>{
  res.locals.user = req.user || null
  next()
})

//Static Folder
app.use(express.static(path.join(__dirname,'public')))

//Routes
app.use('/',require('./routes/index'))
app.use('/auth',require('./routes/auth'))
app.use('/stories',require('./routes/stories'))

const PORT = process.env.PORT || 5000

app.listen(PORT,console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`))