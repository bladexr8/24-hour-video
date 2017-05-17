'use strict';

// this is included implicitly by Lambda
// it can be used to access other AWS
// services such as S3, DynamoDB, etc
var AWS = require('aws-sdk');

exports.handler = function(event, context, callback) {

	// process JSON payload and send response

	//...

	// exit function for a successful response 
	//callback(null, response);

	// exit function for an unsuccessful response 
	//callback(err, response);
};