var chai = require('chai');
var sinon = require('sinon');
var rewire = require('rewire');
var expect = chai.expect;
var assert = chai.assert;

// data provided to caller when s3 listObjects()
// function is invoked
var sampleData = {
    Contents: [
        {
            Key: 'file1.mp4',
            bucket: 'my-bucket'
        },
        {
            Key: 'file2.mp4',
            bucket: 'my-bucket'
        }
    ]
}

describe('LambdaFunction', function() {
    var listObjectsStub, callbackSpy, module;
 
    describe('#execute', function() {
        before(function(done) {
            listObjectsStub = sinon.stub().yields(null, sampleData);
            // spy watches function or variable and
            // reports what it does
            callbackSpy = sinon.spy();

            // callback function Lambda will invoke after run
            var callback = function(error, result) {
                callbackSpy.apply(null, arguments);
                done(); // tell Mocha test has finished
            }

            // get a monkey-patched version of Lambda function
            module = getModule(listObjectsStub);
            // invoke handler to run Lambda function
            module.handler(null, null, callback);
        });

        // look at spy to ensure Lambda function has only been
        // invoked once
        it('should run our function once', function() {
            expect(callbackSpy).has.been.calledOnce;
        });

        it('should have correct results', function() {
            // additional test data we think output from
            // Lambda function will match
            var result = {
                "baseUrl": "https://s3.amazonaws.com",
                "bucket": "serverless-video-transcoded",
                "urls": [
                    {
                        "Key": sampleData.Contents[0].Key,
                        "bucket": "my-bucket",
                    },
                    {
                        "Key": sampleData.Contents[1].Key,
                        "bucket": "my-bucket"
                    }
                ]
            }
            console.log("callbackSpy: ", JSON.stringify(callbackSpy.args));
            console.log("result: ", JSON.stringify([[null, result]]));
            asset.deepEqual(callbackSpy.args, [[null, result]]);
        });
    });
});

// monkey patch Lambda function sp that when S3 listObjects() is called we
// return stub and data prepared earlier
function getModule(listObjects) {
    var rewired = rewire('../index.js');

    rewired.__set__({
        's3': { listObjects: listObjects}
    });

    return rewired;
}