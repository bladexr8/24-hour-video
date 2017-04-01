// validate JWT sent to API Gateway and get user info from Auth0

'use strict';

var jwt = require('jsonwebtoken');
var request = require('request');

exports.handler = function(event, context, callback) {
	if (!event.authToken) {
		callback('[ERROR] Could not find authToken');
		return;
	}

	// get the JWT 
	var token = event.authToken.split(' ')[1];

	// verify the JWT
	var secretBuffer = new Buffer(process.env.AUTH0_SECRET);
	jwt.verify(token, secretBuffer, function(err, decoded) {
		if (err) {
			console.log('Failed JWT verification: ', err,
				'auth: ', event.authToken);
			callback('Authorization Failed');
		} else {
			// set up Auth0 request
			var body = {
				'id_token': token
			};
			var options = {
				url: 'https://' + process.env.DOMAIN + '/tokeninfo',
				method: 'POST',
				json: true,
				body: body
			};

			// validate token against Auth0
			request(options, function(error, response, body) {
				if (!error && response.statusCode === 200) {
					callback(null, body);
				} else {
					callback(error);
				}
			});
		}
	});
};