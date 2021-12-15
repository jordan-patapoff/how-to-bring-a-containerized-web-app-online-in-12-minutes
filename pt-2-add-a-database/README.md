#### Instructions:
1) Complete **all steps** in the tutorial from the root-level [README](https://github.com/jordan-patapoff/how-to-bring-a-containerized-web-app-online-in-12-minutes/blob/master/README.md) using the `web-app-node` example app.
2) In Cloud9 file browser, expand `cdk-app` folder then expend `lib` folder. Drag & drop the downloaded `pt-2-add-a-database/cdk-app-stack.ts` file into the `lib` folder, overwriting the existing file.
3) `cdk deploy` then press `y` if prompted to confirm changes.
4) After the deploy is complete, take note of the outputted `RDSSecretsManagerSecretId` value in the Cloud9 console.
5) In Cloud9 file browser, drag & drop the downloaded `pt-2-add-a-database/server.js` file into the `web-app-node` folder, overwriting the existing file.
6) In Cloud9, open the `web-app-node/server.js` file, replace `replace-with-CfnOutput-RDSSecretsManagerSecretId-value` with the `RDSSecretsManagerSecretId` value from Step 4.
7) `cdk deploy` then press `y` if prompted to confirm changes.
