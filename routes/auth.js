var models = require('../models')
, fs= require('fs')
, mongoose = require('mongoose')

exports.router = function (app) {
	app.get('/auth', viewAuth)
	.post('/auth', doAuth)
	.get('/logout', logout)
}

function viewAuth (req, res) {
	res.render('auth', { title: "Authenticate" });
}

function doAuth (req, res) {
	var type = req.body.auth;
	var email = req.body.email,
	password = req.body.password,
	name = req.body.name;
	
	models.User.findOne({
		email: email
	}, function(err, user) {
		if (err) throw err;
		
		if (type == 'login') {
			if (user != null && password == user.password) {
				req.session.loggedin = true;
				req.session.userid = user._id;
				res.redirect('/assignments')
				return;
			}
		} else {
			if (user == null) {
				user = new models.User({
					name: name,
					email: email,
					password: password, // TODO hash this
					teacher: false
				})
				
				user.save(function(err) {
					if (err) throw err;
				});
				
				req.session.loggedin = true;
				req.session.userid = user._id;
				res.redirect('/assignments')
				return;
			} // else - Email taken
		}
		
		res.redirect('/auth')
	})
}

function logout (req, res) {
	req.session.destroy();
	res.redirect('/')
}