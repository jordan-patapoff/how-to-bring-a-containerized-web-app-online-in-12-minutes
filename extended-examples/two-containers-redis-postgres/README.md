This proof of concept deploys two different containers (API and Web) in an ECS Fargate Task, a Redis cluster using ElastiCache, and a Postgres DB using RDS. It provisions all necessary networking (VPCs, Security Groups, subnet group assignment, etc) following best practices. The API and Web containers run node and are setup for the following:

#### API resources:
* GET /api/healthcheck
  * returns status code 200 with text "Successful healthcheck!" for ALB healthcheck
* GET /api/random-number
  * returns random number between 0 and 100 (inclusive of both 0 and 100)
* GET /api/postgres-select-version
  * NOTE: you will need to update the `SecretId` parameter by retrieving the "Secret name" from [AWS Secrets Manaer](https://console.aws.amazon.com/secretsmanager/home) after running `cdk deploy` for the first time
  * gets DB conenction string, username, password, etc from AWS Secrets Manager, connects to the Postgres instance, and runs `SELECT version();`

#### Web resources:
* GET /
  * returns status code 200 with text "Web app"
* GET /redis-server-info
  * NOTE: you will need to update the `host` parameter by retrieving the "Primary Endpoint" from [Amazon ElastiCache](https://console.aws.amazon.com/elasticache/home) after running `cdk deploy` for the first time
  * connects to Redis and returns [client.server_info](https://www.npmjs.com/package/redis#clientserver_info)
* GET /random-number-api-service-call
  * direct call to the API running in the same ECS task localhost:8888/api/random-number and returns the random number


#### Instructions:
* Drop in the CDK code, run `cdk deploy`
* After command completes, update the `SecretId` parameter in the API's server.js and the `host` parameter in the Web's server.js
* Run `cdk deploy` again
* Test demo
