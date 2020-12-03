import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecr from "@aws-cdk/aws-ecr";
import * as ecr_assets from "@aws-cdk/aws-ecr-assets";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";

export class CdkAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a Docker image and upload it to the Amazon Elastic Container Registry (ECR)
    const dockerImage = new ecr_assets.DockerImageAsset(this, "MyJDPDockerImage", {
      directory: "/home/ec2-user/environment/node-app"
    });
    
    // Create a new VPC and NAT Gateway
    const vpc = new ec2.Vpc(this, "MyJDPVpc", {
      maxAzs: 3 // Default is all AZs in region
    });

    // Create a new Amazon Elastic Container Service (ECS) cluster
    const cluster = new ecs.Cluster(this, "MyJDPCluster", {
      vpc: vpc
    });

    // Create a load-balanced Fargate service and make it public
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "MyJDPFargateService", {
      cluster: cluster, // Required
      cpu: 512, // Default is 256
      desiredCount: 2, // Default is 1
      taskImageOptions: {
        // image: ecs.ContainerImage.fromEcrRepository(containerImage),
        image: ecs.ContainerImage.fromDockerImageAsset(dockerImage),
        containerPort: 8080
      },
      memoryLimitMiB: 2048, // Default is 512
      publicLoadBalancer: true // Default is false
    });
  }
}
