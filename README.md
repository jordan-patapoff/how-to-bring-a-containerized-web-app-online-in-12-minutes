# How to bring a containerized web app online in 12 minutes (from start to finish)

1) Create Cloud9 instance with all defaults.
2) From this [GitHub repository](https://github.com/jordan-patapoff/how-to-bring-a-containerized-web-app-online-in-12-minutes), click the green Code button, and click Download Zip. Unzip the downloaded file.
3) Drag & drop the `bash-scripts` folder into the Cloud9 file explorer.
4) Drag & drop the `web-app-node` folder into the Cloud9 file explorer. *Alternatively you can use the `web-app-flask` folder to get started with a Flask application. These instructions assume the node applicaiton.*
5) `chmod +x bash-scripts/resize-cloud9.sh`
6) `./bash-scripts/resize-cloud9.sh 30`
7) `npm update -g`
8) `mkdir cdk-app && cd cdk-app`
9) `cdk init --language typescript`
10) `cdk bootstrap`
11) In Cloud9 file browser, expand `cdk-app` then expend `lib`. Drag & drop the downloaded `cdk-app-stack.ts` file into the `lib` folder, overwriting the existing file.
12) `npm install @aws-cdk/core @aws-cdk/aws-ec2 @aws-cdk/aws-ecs @aws-cdk/aws-ecr @aws-cdk/aws-ecr-assets @aws-cdk/aws-ecs-patterns`
13) `cdk deploy` then press `y` to confirm changes
