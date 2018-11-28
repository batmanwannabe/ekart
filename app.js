var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var mongoose = require('mongoose');
var config = require('./config/database');
var fileUpload = require('express-fileupload');


//connect to db
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

//init app
var app = express();

//view engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

//set public folder
app.use(express.static(path.join(__dirname,'public')));

//set global variables
app.locals.errors = null;


// Get Category Model
var Category = require('./models/category');

// Get all categories to pass to header.ejs
Category.find(function (err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }
});
//express fileupload middleware
app.use(fileUpload());



//Body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


//express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))


//Express validator
app.use(expressValidator({
    customValidators:{
        isImage: function(value, filename){
            var extension = (path.extname(filename)).toLowerCase();
            switch(extension){
                case '.jpg':
                    return '.jpg';
                case 'jpeg':
                    return 'jpeg';
                case 'png':
                    return 'png';
            }
        }
    }
}));


//Express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


//cart
app.get('*', function(req,res,next) {
   res.locals.cart = req.session.cart;
   next();
});



//set router
var pages=require('./routes/pages.js');
var adminPages=require('./routes/admin_pages.js');
var products=require('./routes/products.js');
var cart=require('./routes/cart.js');
var adminCategories = require('./routes/admin_category.js');
var adminProducts = require('./routes/admin_products.js');

app.use('/admin/pages',adminPages);
app.use('/admin/categories',adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart',cart);

app.use('/',pages);

//start the server
var port =3000;
app.listen(port, function() { 
	console.log('server started');
});