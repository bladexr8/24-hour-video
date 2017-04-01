// supply a policy to allow uploads to S3

'use strict';

var AWS = require('aws-sdk');
var async = require('async');
var crypto = require('crypto');

var s3 = new AWS.S3();

function createErrorResponse(code, message) {
	var response = {
		'statusCode': code,
		'headers': {
			'Access-Control-Allow-Origin': '*'
		},
		'body': JSON.stringify({
			'message': message
		})
	}
	return response;
}

function createSuccessResponse(message) {
	var response = {
		'statusCode': 200,
		'headers': {
			'Access-Control-Allow-Origin': '*'
		},
		'body': JSON.stringify(message)
	}
	return response;
}

// convert a given buffer to it's base64 representation
function base64encode(value) {
	return new Buffer(value).toString('base64');
}

// create a 24 hour expiration window for policy
function generateExpirationDate() {
	var currentDate = new Date();
	currentDate = currentDate.setDate(currentDate.getDate() + 1);
	return new Date(currentDate).toISOString();
}

// create a policy document which is a JSON structure with conditions as
// key/value pairs
function generatePolicyDocument(filename, next) {
	// random hex string to add to filename to avoid collisions
	// with same names
	var directory = crypto.randomBytes(20).toString('hex');
	var key = directory + '/' + filename;
	var expiration = generateExpirationDate();

	// policy with conditions the S3 Access Control List must meet
	var policy = {
		'expiration': expiration,
		'conditions': [
			{key: key},
			{bucket: process.env.UPLOAD_BUCKET},
			{acl: 'private'},
			['starts-with', '$Content-Type', '']
		]
	};

	next(null, key, policy);
}

// convert policy to its base64 representation
function encode(key, policy, next) {
	var encoding = base64encode(JSON.stringify(policy)).replace('\n','');
	next(null, key, policy, encoding);
}

// create HMAC signature out of policy using IAM user's secret key
function sign(key, policy, encoding, next) {
	var signature = crypto.createHmac('sha1', process.env.SECRET_ACCESS_KEY).update(encoding).digest('base64');
	next(null, key, policy, encoding, signature);
}

// Lambda Entry function
exports.handler = function(event, context, callback) {
	var filename = null;

	// get filename of file to be uploaded
	if (event.queryStringParameters && event.queryStringParameters.filename) {
		filename = decodeURIComponent(event.queryStringParameters.filename);
	} else {
		callback(null, createErrorResponse(500, 'Filename must be provided'));
		return;
	}

	// use async waterfall pattern to return policy, signature, etc to caller
	async.waterfall([async.apply(generatePolicyDocument, filename),
		encode, sign], function(err, key, policy, encoding, signature) {
			if (err) {
				callback(null, createErrorResponse(500, err));
			} else {
				var result = {
					signature: signature,
					encoded_policy: encoding,
					access_key: process.env.ACCESS_KEY,
					upload_url: process.env.UPLOAD_URI + '/' + process.env.UPLOAD_BUCKET,
					key: key
				}
				callback(null, createSuccessResponse(result));
			}
		});
};
