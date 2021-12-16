# Troubleshooting Tips

## It takes too long to deploy changes
Add the following code:
```
fargateService.targetGroup.setAttribute('deregistration_delay.timeout_seconds', '10');

fargateService.targetGroup.configureHealthCheck({
  healthyThresholdCount : 2,
  interval: Duration.seconds(15),
  timeout: Duration.seconds(5)
});
```
