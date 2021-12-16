# CDK Pipelines ELI5 tutorial
At the end of this tutorial, you will be able to `git push` into your git repo, and your infrastructure (CDK app) and application (node web app) will be updated. For simplicity we are checking the CDK app and node web app into the same repo.

1) Create a [Cloud9](https://console.aws.amazon.com/cloud9/home) instance with all defaults.
2) From this [GitHub repository](https://github.com/jordan-patapoff/how-to-bring-a-containerized-web-app-online-in-12-minutes), click the green Code button, and click Download Zip. Unzip the downloaded file.
3) Drag & drop the `bash-scripts` folder into the Cloud9 file explorer.
4) `chmod +x bash-scripts/resize-cloud9.sh` to give yourself permission to execute the resize script.
5) `./bash-scripts/resize-cloud9.sh 50` to give yourself 50 GB of disk space since the default allocation is too small.
6) `npm update -g`
7) `mkdir cdk-app && cd cdk-app`
8) `cdk init --language typescript` to initialize the CDK project
9) `cdk bootstrap` to boostrap your CDK environment in AWS. Only needs to be done once per account per region, doesn't hurt to rerun if unsure of bootstrap status.
10) Drag & drop the `web-app-node` folder from the root of the downloaded GitHub repository into the `cdk-app` folder in the Cloud9 file explorer.
11) In the Cloud9 file browser, expand the `cdk-app` folder then expend the `lib` folder. Drag & drop the downloaded `extended-examples/cdk-pipelines/cdk-app-stack.ts` file into the `lib` folder, overwriting the existing file.
12) `echo '!/web-app-node/*' >> .gitignore` to ensure the entire contents of the `web-app-node` folder is checked into your repository.
13) `npm install aws-cdk-lib constructs`
14) `cdk deploy` then press `y` to confirm changes
15) After the CDK deploy is complete, visit [CodePipline](https://console.aws.amazon.com/codesuite/codepipeline/home) in the web console. You should see that the most recent execution Failed, and if you click into the pipeline and view details, you will see *The action failed because no branch named master was found in the selected AWS CodeCommit repository MyJDPRepository.* This is expected. We used CDK Pipelines to create your CI/CD evironment using CodePipeline, along with an empty CodeCommit git repo, but we haven't checked any code into the repo.
16) Next we will create a CodeCommit git user so we can push code into the repo from our development environment. Visit [IAM](https://console.aws.amazon.com/iam/home) in the web console and click **Users**.
17) Click **Add users**, give a User name (ex: 'jdp-codecommit'), click **Access key - Programmatic access** checkbox, click **Next: Permissions**.
18) Click **Attach existing policies directly** toggle, search for and select **CodeCommitPowerUser**, click **Next: Tags**.
19) Click **Next: Review**, click **Create user**. Click **Close**. (don't worry about saving these IAM creds, you don't need them)
20) Click the User name of the User you just created (ex: 'jdp-codecommit'), click **Security credentials** tab.
21) Under the **HTTPS Git credentials for AWS CodeCommit** section, click **Generate credentials**.
22) Click **Download credentials** then click **Close**. 
23) Visit [CodeCommit](https://console.aws.amazon.com/codesuite/codecommit/home) and under the **Clone URL** column, click **HTTPS** to copy the value to your clipboard. Paste it into a text editor for use later.
24) Return to your Cloud9 development environment to configure git with the user credentials you just created.
25) `git config --global credential.helper 'cache --timeout=31536000'`
26) For this command, replace `CLONE_URL` with the HTTPS Clone URL from step 23. `git remote add origin CLONE_URL`
27) `git add .`
28) `git commit -m "initial commit"`
29) `git push origin master` You will be promped for username/password. Use the credentials in the CodeCommit csv you downloaded in step 22.
30) Visit [CodePipline](https://console.aws.amazon.com/codesuite/codepipeline/home), select the pipeline to watch the deployment. Keep in mind this first deploy is creating the bulk of your infrastructure (ECS cluster, Fargate Services, Application Load Balancer, etc) and future deploys that only modify the application code of the node web server will be faster. See [this tip](https://github.com/jordan-patapoff/how-to-bring-a-containerized-web-app-online-in-12-minutes/blob/master/troubleshooting-tips/README.md) for speeding up deploys when only pushing updates to the application code of the node web server.
31) Scroll to the bottom of the pipeline to the action that has **Deploy** action in the **Prod** stage. Click **Details** to be taken to the details of the CloudFormation stack. Click the **Outputs** tab. Open the **MyJDPFargateServiceServiceURL*** URL in your browser and you should see *NODE How to bring a containerized web app online in 12 minutes (from start to finish)* if everything went as expected.
32) 🎉 🚀
