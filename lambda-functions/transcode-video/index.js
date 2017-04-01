'use strict';

var AWS = require('aws-sdk');

var elasticTranscoder = new AWS.ElasticTranscoder({
	region: 'us-east-1'
});

exports.handler = function(event, context, callback) {
	var key = event.Records[0].s3.object.key;
	// decode key to get original filename with spaces
	var sourceKey = decodeURIComponent(key.replace(/\+/g, " "));
	// don't need filename extension for transcoded files
	var outputKey = sourceKey.split('.')[0];
	
	console.log('[INFO] key: ', key, sourceKey, outputKey);
	
	var params = {
		PipelineId: '1487581687350-zsihlq',
		//OutputKeyPrefix: outputKey + '/',
		Input: {
			Key: sourceKey
		},
		Outputs: [
			{
				Key: outputKey + '-1080p' + '.mp4',
				PresetId: '1351620000001-000001'
			},
			{
				Key: outputKey + '-720p' + '.mp4',
				PresetId: '1351620000001-000010'
			},
			{
				Key: outputKey + '-web-720p' + '.mp4',
				PresetId: '1351620000001-100070'
			},
		]
	};
	
	elasticTranscoder.createJob(params, function(error, data) {
		if (error) {
			callback(error);
		}
	});	
};