import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecr from "@aws-cdk/aws-ecr";
import * as ecr_assets from "@aws-cdk/aws-ecr-assets";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";
import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2";
import * as elasticache from "@aws-cdk/aws-elasticache";
import * as rds from "@aws-cdk/aws-rds";
import * as iam from "@aws-cdk/aws-iam";

export class CdkAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const webAppDockerImage = new ecr_assets.DockerImageAsset(this, "MyWebAppDockerImage", {
      directory: "/home/ec2-user/environment/web-app"
    });
    
    const apiAppDockerImage = new ecr_assets.DockerImageAsset(this, "MyAPIAppDockerImage", {
      directory: "/home/ec2-user/environment/api-app"
    });
    
    // Create a new VPC and NAT Gateway
    const vpc = new ec2.Vpc(this, "MyJDPVpc", {
      maxAzs: 3 // Default is all AZs in region
    });

    // Create a new Amazon Elastic Container Service (ECS) cluster
    const cluster = new ecs.Cluster(this, "MyJDPCluster", {
      vpc: vpc
    });
    
    const fargateTaskDefinition = new ecs.FargateTaskDefinition(this, 'MyJDPTaskDef', {
      memoryLimitMiB: 2048,
      cpu: 1024
    });
    
    const webContainer = fargateTaskDefinition.addContainer("MyJDPWebContainer", {
      image: ecs.ContainerImage.fromDockerImageAsset(webAppDockerImage),
      memoryLimitMiB: 1024,
      cpu: 512
    });
    
    const apiContainer = fargateTaskDefinition.addContainer("MyJDPAPIContainer", {
      image: ecs.ContainerImage.fromDockerImageAsset(apiAppDockerImage),
      memoryLimitMiB: 1024,
      cpu: 512
    });
    
    const loadBalancedFargateService = new ecs_patterns.ApplicationMultipleTargetGroupsFargateService(this, 'MyJDPFargateService', {
      cluster,
      desiredCount: 1,
      taskDefinition: fargateTaskDefinition,
      targetGroups: [
        {
          // Default target group
          priority: 10,
          containerPort: 8888,
          pathPattern: '/api/*'
        },
        {
          priority: 20,
          containerPort: 8080,
          pathPattern: '*'
        }
      ]
    });
    
    // TODO: loadBalancedFargateService.targetGroup is the default targetGroup
    // need to find way to config deregistration_delay and healthcheck for all targetGroups, not just default
    // Alternatively: break open ApplicationMultipleTargetGroupsFargateService and use the
    // FargateService construct, addPortMappings to containers, add target groups to listeners, etc
    loadBalancedFargateService.targetGroup.setAttribute('deregistration_delay.timeout_seconds', '10');
    loadBalancedFargateService.targetGroup.configureHealthCheck({
      healthyThresholdCount : 2,
      interval: cdk.Duration.seconds(15),
      timeout: cdk.Duration.seconds(5),
      path: '/api/healthcheck'
    });
    
    loadBalancedFargateService.listener.addAction('default',{
      // Default is action required by ALB. Should never be reached due to targetGroup * pathPattern
      action : elbv2.ListenerAction.fixedResponse(500)
    });
    
    
    // ELASTICACHE
    // Define a group for telling Elasticache which subnets to put cache nodes in.
    const elasticacheSubnetGroup = new elasticache.CfnSubnetGroup(this, "MyJDPElasticacheSubnetGroup", {
      description: "List of subnets used for redis cache",
      subnetIds: vpc.privateSubnets.map(subnet => subnet.subnetId)
    });
    
    // The security group that defines network level access to the cluster
    const elasticacheSecurityGroup = new ec2.SecurityGroup(this, "MyJDPElasticacheSecurityGroup", {vpc: vpc});
    const connections = new ec2.Connections({
      securityGroups: [elasticacheSecurityGroup],
      defaultPort: ec2.Port.tcp(6379)
    });
    connections.allowFrom(loadBalancedFargateService.service, ec2.Port.tcp(6379), 'MyJDPTaskToElasticacheInboundRule');
    
    const elasticacheCluster = new elasticache.CfnCacheCluster(this, "MyJDPElasticacheCluster", {
      cacheNodeType: 'cache.t2.micro',
      engine: 'redis',
      numCacheNodes: 1,
      autoMinorVersionUpgrade: true,
      cacheSubnetGroupName: elasticacheSubnetGroup.ref,
      vpcSecurityGroupIds: [
        elasticacheSecurityGroup.securityGroupId,
      ]
    });
    elasticacheCluster.addDependsOn(elasticacheSubnetGroup);
    
    
    // RDS
    const dbInstance = new rds.DatabaseInstance(this, "MyJDPRDSInstance", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_12,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.M5, ec2.InstanceSize.LARGE),
      vpc,
      maxAllocatedStorage: 200
    });
    
    // Allow the application running on Fargate to access AWS Secrets Manager
    // AWS Secrets Manager stores the database's connection string, username, and password 
    const getSecretsPolicy = new iam.PolicyStatement({
      resources: [dbInstance.secret!.secretArn],
      actions: ['secretsmanager:GetSecretValue'],
      effect: iam.Effect.ALLOW 
    });
    loadBalancedFargateService.taskDefinition.addToTaskRolePolicy(getSecretsPolicy);
    
    // Allow the application running on Fargate to connect to the database on port 5432
    dbInstance.connections.allowFrom(loadBalancedFargateService.service, ec2.Port.tcp(5432), 'MyJDPTaskToDBInboundRule');
  }
}
