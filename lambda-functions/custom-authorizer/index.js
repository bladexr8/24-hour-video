// validate JWT sent to API Gateway

// NOTE: If re-using this custom authorizer for different API
// endpoints, set the "Result in TTL seconds" for custom
// authorizer to 0 so authorisation results aren't cached

'use strict';

var jwt = require('jsonwebtoken');

// AWS SDK is available by default in a Lambda function
// if JWT valid, generate an AWS Policy to allow
// invocation of Lambda function
var generatePolicy = function(principalId, effect, resource) {
	var authResponse = {};
	authResponse.principalId = principalId;
	if (effect && resource) {
		var policyDocument = {};
		policyDocument.Version = '2012-10-17';
		policyDocument.Statement = [];
		var statementOne = {};
		statementOne.Action = 'execute-api:Invoke';
		statementOne.Effect = effect;
		statementOne.Resource = resource;
		console.log('statementOne = ', JSON.stringify(statementOne));
		policyDocument.Statement[0] = statementOne;
		authResponse.policyDocument = policyDocument;
	}
	console.log('[INFO] Generated Policy: ', authResponse);
	console.log('[INFO] Policy Statement: ', JSON.stringify(authResponse.policyDocument));
	return authResponse;
};

exports.handler = function(event, context, callback) {
	if (!event.authorizationToken) {
		callback('[ERROR] Could not find authToken');
		return;
	}

	// get the JWT 
	var token = event.authorizationToken.split(' ')[1];

	// verify the JWT
	var secretBuffer = new Buffer(process.env.AUTH0_SECRET);
	jwt.verify(token, secretBuffer, function(err, decoded) {
		if (err) {
			console.log('Failed JWT verification: ', err,
				'auth: ', event.authToken);
			callback('Authorization Failed');
		} else {
			console.log('[INFO] Authentication Successful...');
			// return policy allowing execute of Lambda function
			callback(null, generatePolicy('user', 'allow', event.methodArn));
		}
	});
};