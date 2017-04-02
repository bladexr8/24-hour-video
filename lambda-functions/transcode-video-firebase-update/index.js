'use strict';

var AWS = require('aws-sdk');
var firebase = require('firebase');

// initialize and authenticate with Firebase
firebase.initializeApp({
	serviceAccount: process.env.SERVICE_ACCOUNT,
	databaseURL: process.env.DATABASE_URL
});

exports.handler = function(event, context, callback) {

	// set this flag because we want to suspend function
	// as soon as we invoke callback. This is required
	// because we are using Firebase. After writing to
	// Firebase, it will open a connection, which
	// may keep Lambda function alive until its timeout.
	// This could potentially increase cost to run function
	// and result in function running multiple times
	context.callbackWaitsForEmptyEventLoop = false;

	// Lambda function will be invoked by Sns so we
	// need to unpack it
	var message = JSON.parse(event.Records[0].Sns.Message);

	var key = message.Records[0].s3.object.key;
	var bucket = message.Records[0].s3.bucket.name;

	// decode key to get original filename with spaces
	var sourceKey = decodeURIComponent(key.replace(/\+/g, " "));

	// guid isolated from key name of S3 object
	var uniqueVideoKey = sourceKey.split('/')[0];

	var database = firebase.database().ref();

	database.child('videos').child(uniqueVideoKey).set({
		transcoding: false,
		key: key,
		bucket: process.env.S3
	}).catch(function(err) {
		callback(err);
	});
};