var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose')
, MongoStore = require('connect-mongo')(express)
, models = require('./models')

var app = express();

var db = "mongodb://127.0.0.1:27017/assignments";
mongoose.connect(db, {auto_reconnect: true, native_parser: true});
sessionStore = new MongoStore({
	url: db
});

// all environments
app.enable('trust proxy');
app.set('port', process.env.PORT || 3000); // Port
app.set('views', __dirname + '/views');
app.set('view engine', 'jade'); // Templating engine
app.set('view cache', true); // Cache views
app.set('app version', '0.2.0'); // App version
app.locals.pretty = process.env.NODE_ENV != 'production' // Pretty HTML outside production mode

//app.use(bugsnag.requestHandler);
app.use(express.logger('dev')); // Pretty log
app.use(express.limit('25mb')); // File upload limit
app.use("/", express.static(path.join(__dirname, 'public'))); // serve static files
app.use(express.bodyParser()); // Parse the request body
app.use(express.cookieParser()); // Parse cookies from header
app.use(express.methodOverride());
app.use(express.session({ // Session store
	secret: "K3hsadkasdoijqwpoie",
	store: sessionStore,
	cookie: {
		maxAge: 604800000 // 7 days in s * 10^3
	}
}));
app.use(express.csrf()); // csrf protection

// Custom middleware
app.use(function(req, res, next) {
	// request middleware
	
	res.locals.token = req.csrfToken();
	
	// flash
	if (req.session.flash) {
		res.locals.flash = req.session.flash;
	} else {
		res.locals.flash = [];
	}
	
	req.session.flash = [];
	
	if (req.session.userid && req.session.loggedin) {
		models.User.findOne({
			_id: mongoose.Types.ObjectId(req.session.userid)
		}, function(err, user) {
			if (err) throw err;
			
			res.locals.user = user;
			
			next();
		})
	} else {
		res.locals.user = null;
		next();
	}
});

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler()); // Let xpress handle errors
	app.set('view cache', false); // Tell Jade not to cache views
}

var server = http.createServer(app)
server.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

// routes
routes.router(app);