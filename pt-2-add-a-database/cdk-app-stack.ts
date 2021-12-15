import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecr_assets from 'aws-cdk-lib/aws-ecr-assets';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as iam from 'aws-cdk-lib/aws-iam';

export class CdkAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create a Docker image and upload it to the Amazon Elastic Container Registry (ECR)
    const dockerImage = new ecr_assets.DockerImageAsset(this, "MyJDPDockerImage", {
      directory: "/home/ec2-user/environment/web-app-node"
    });
    
    // Create a new VPC and NAT Gateway
    const vpc = new ec2.Vpc(this, "MyJDPVpc", {
      maxAzs: 3 // Default is all AZs in region
    });

    // Create a new Amazon Elastic Container Service (ECS) cluster
    const cluster = new ecs.Cluster(this, "MyJDPCluster", {
      vpc: vpc
    });
    
    // Create a new Amazon Relational Database Service (RDS) Postgres instance
    const dbinstance = new rds.DatabaseInstance(this, 'MyJDPRDSInstance', {
      engine: rds.DatabaseInstanceEngine.POSTGRES,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.M5, ec2.InstanceSize.LARGE),
      vpc,
      maxAllocatedStorage: 200,
    });

    // Create a load-balanced Fargate service and make it public
    const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "MyJDPFargateService", {
      cluster: cluster, // Required
      cpu: 512, // Default is 256
      desiredCount: 2, // Default is 1
      taskImageOptions: {
        image: ecs.ContainerImage.fromDockerImageAsset(dockerImage),
        containerPort: 8080
      },
      memoryLimitMiB: 2048, // Default is 512
      publicLoadBalancer: true // Default is false
    });
    
    // Allow the application running on Fargate to access AWS Secrets Manager
    // AWS Secrets Manager stores the database's connection string, username, and password 
    const getSecretsPolicy = new iam.PolicyStatement({
      resources: [dbinstance.secret!.secretArn],
      actions: ['secretsmanager:GetSecretValue'],
      effect: iam.Effect.ALLOW 
    });
    fargateService.taskDefinition.addToTaskRolePolicy(getSecretsPolicy);
    
    // Allow the application running on Fargate to connect to the database on port 5432
    dbinstance.connections.allowFrom(fargateService.service, ec2.Port.tcp(5432), 'MyJDPTaskToDBInboundRule');
  }
}
