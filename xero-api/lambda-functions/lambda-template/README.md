# Lambda Function Template

This is a Lambda function template to kick start Lambda function development.

## Getting Started
- Open package.json and update name, description fields
- update the "create" and "deploy" npm commands with the Lambda function name and IAM Lambda Execution role.
- run npm install command to fetch base packages
- use npm to install additional required modules
- ensure you have aws command line tool installed (http://docs.aws.amazon.com/cli/latest/userguide/installing.html)

## Create Lambda function
$ npm create

This will create the Lambda Function in the AWS account you are currently logged into through the AWS CLI.

## Deploy Lambda Function
$ npm create

This will create a ZIP archive and deploy the Lambda Function to the AWS account you are currently logged into through the AWS CLI.

## Testing Locally
$ npm test

- NOTE: set up test payload in test/events.json file
