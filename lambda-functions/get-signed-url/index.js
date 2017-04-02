'use strict';

var AWS = require('aws-sdk');

var s3 = new AWS.S3();

exports.handler = function(event, context, callback) {

	// generate a signed URL
	s3.getSignedUrl('getObject', {
		Bucket: process.env.BUCKET,
		Key: event.queryStringParameters.key,
		Expires: 900
	}, function(err, url) {
		if (err) {
			callback(err);
		} else {
			var response = {
				'statusCode': 200,
				'headers': {'Access-Control-Allow-Origin':'*'},
				'body': JSON.stringify({'url': url})
			}

			callback(null, response);
		}
	});
};