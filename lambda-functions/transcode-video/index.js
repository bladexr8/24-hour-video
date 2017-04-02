'use strict';

var AWS = require('aws-sdk');
var firebase = require('firebase');

var elasticTranscoder = new AWS.ElasticTranscoder({
	region: process.env.ELASTIC_TRANSCODER_REGION
});

// initialize and authenticate with Firebase
firebase.initializeApp({
	serviceAccount: process.env.SERVICE_ACCOUNT,
	databaseURL: process.env.DATABASE_URL
});

// create an entry in database with key transcoding set to true
// will only run if elastic transcoder job is submitted successfully
function pushVideoEntryToFirebase(key, callback) {
	console.log('[INFO] Adding video entry to firebase at key: ', key);

	// returns root of JSON tree in database
	var database = firebase.database().ref();

	database.child('videos').child(key)
		.set({
			transcoding: true
		})
		.then(function() {
			callback(null, 'Video record saved to firebase');
		})
		.catch(function(err) {
			callback(err);
		});
}

exports.handler = function(event, context, callback) {

	// set this flag because we want to suspend function
	// as soon as we invoke callback. This is required
	// because we are using Firebase. After writing to
	// Firebase, it will open a connection, which
	// may keep Lambda function alive until its timeout.
	// This could potentially increase cost to run function
	// and result in function running multiple times
	context.callbackWaitsForEmptyEventLoop = false;

	var key = event.Records[0].s3.object.key;
	// decode key to get original filename with spaces
	var sourceKey = decodeURIComponent(key.replace(/\+/g, " "));
	// don't need filename extension for transcoded files
	var outputKey = sourceKey.split('.')[0];

	// guid isolated from key name of S3 object
	var uniqueVideoKey = outputKey.split('/')[0];
	
	console.log('[INFO] key: ', key, sourceKey, outputKey);
	
	var params = {
		PipelineId: process.env.ELASTIC_TRANSCODER_PIPELINE_ID,
		//OutputKeyPrefix: outputKey + '/',
		Input: {
			Key: sourceKey
		},
		Outputs: [
			/*{
				Key: outputKey + '-1080p' + '.mp4',
				PresetId: '1351620000001-000001'
			},*/
			{
				Key: outputKey + '-720p' + '.mp4',
				PresetId: '1351620000001-000010'
			}/*,
			{
				Key: outputKey + '-web-720p' + '.mp4',
				PresetId: '1351620000001-100070'
			},*/
		]
	};
	
	elasticTranscoder.createJob(params, function(error, data) {
		if (error) {
			console.log('[ERROR] Error Creating Elastic Transcoder Job');
			callback(error);
			return;
		}
		console.log('[INFO] Elastic Transcoder job created successfully');
		pushVideoEntryToFirebase(uniqueVideoKey, callback);
	});	
};