var models = require('../models')
, fs= require('fs')
, mongoose = require('mongoose')
, auth = require('./auth')

function authd (req, res, next) {
	if (req.session.loggedin == true) {
		next();
	} else {
		res.redirect("/auth");
	}
}

function getAssignment (req, res, next) {
	try {
		var id = mongoose.Types.ObjectId(req.params.id);
		
		models.Assignment.findOne({
			_id: mongoose.Types.ObjectId(req.params.id),
			owner: res.locals.user._id,
			deleted: false
		}, function(err, assignment) {
			res.locals.assignment = assignment;
			
			next()
		});
	} catch(ex) {
		res.redirect('/assignments');
	}
}

exports.router = function(app) {
	app.get('/', index)
	.get('/add', addAssignment)
	.post('/add', submitAssignment)
	.get('/assignments', authd, assignments)
	.get('/assignment/:id', authd, getAssignment, viewAssignment)
	
	auth.router(app);
}

function index(req, res){
	res.render('index', { title: 'Welcome' });
};

function addAssignment (req, res) {
	res.render("addAssignment", { title: "Add Assignment" })
}
function submitAssignment (req, res) {
	var ass = new models.Assignment({
		name: req.body.name,
		due: new Date(req.body.due),
		criteria: [],
		instructor: req.body.instructor,
		owner: res.locals.user._id
	})
	
	console.log(req.body)
	for (var i = 0; i < req.body.criteria.length; i++) {
		ass.criteria.push({
			name: req.body.criteria[i]
		});
	}
	
	if (req.files.file && req.files.file.name != null) {
		fs.readFile(req.files.file.path, function(err, file) {
			if (err) throw err;
			fs.writeFile(__dirname + "/../public/assignmentFiles/"+ass._id+req.files.file.name, file, function(err) {
				if (err) throw err;
				
				ass.file = "/assignmentFiles/"+ass._id+req.files.file.name;
				ass.save(function(err) {
					if (err) throw err;
				});
				
				res.redirect('/assignment/'+ass._id);
			})
		})
	} else {
		ass.save(function(err) {
			if (err) throw err;
		});
		
		res.redirect('/assignment/'+ass._id);
	}
}

function assignments (req, res) {
	models.Assignment.getAll(res.locals.user, function(assignments) {
		res.locals.assignments = assignments || [];
		res.render('assignments', { title: "Assignments" });
	})
}

function viewAssignment (req, res) {
	res.render('assignment', { title: res.locals.assignment.name })
}