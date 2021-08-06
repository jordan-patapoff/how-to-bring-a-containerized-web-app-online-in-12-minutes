**TODO**
* bin/cdk-app.ts set account ID, region
* update instructions to npm install @aws-cdk/core @aws-cdk/aws-ec2 @aws-cdk/aws-ecs @aws-cdk/aws-ecr @aws-cdk/aws-ecr-assets @aws-cdk/aws-ecs-patterns **--save**
* update dockerfile to FROM public.ecr.aws/bitnami/node:12 due to docker.com rate limiting
* nest web-app-node folder INSIDE cdk-app since `cdk init` will init a git repo
* after you first deploy, you'll need to setup your dev machine with CodeCommit. Create IAM User with CodeCommit permissions, generate git username/passowrd


OTHER SETUP NOTES:

npm update -g

export CDK_NEW_BOOTSTRAP=1

cdk bootstrap aws://ACCOUNT_ID/us-west-2 --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess aws://ACCOUNT_ID/us-west-2

mkdir cdk-app && cd cdk-app

cdk init --language typescript

cd ~/environment/bash-scripts

chmod +x  resize-cloud9.sh

./resize-cloud9.sh 100

npm install @aws-cdk/core @aws-cdk/aws-ec2 @aws-cdk/aws-ecs @aws-cdk/aws-ecr @aws-cdk/aws-ecr-assets @aws-cdk/aws-ecs-patterns

git config --global credential.helper 'cache --timeout=31536000'

git remote add origin https://git-codecommit.us-west-2.amazonaws.com/v1/repos/MyJDPRepository

git add .

git commit -m "initial commit"

git push origin master

cdk deploy
