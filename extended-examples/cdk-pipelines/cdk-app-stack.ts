import { Stack, StackProps, CfnOutput, Duration, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecr_assets from 'aws-cdk-lib/aws-ecr-assets';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as pipelines from 'aws-cdk-lib/pipelines';
import * as iam from 'aws-cdk-lib/aws-iam';

class JDPStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create a Docker image and upload it to the Amazon Elastic Container Registry (ECR)
    const dockerImage = new ecr_assets.DockerImageAsset(this, "MyJDPDockerImage", {
      directory: "web-app-node"
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
        image: ecs.ContainerImage.fromDockerImageAsset(dockerImage),
        containerPort: 8080
      },
      memoryLimitMiB: 2048, // Default is 512
      publicLoadBalancer: true // Default is false
    });
    
  }
}

class MyJDPApplication extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);
    
    new JDPStack(this, 'JDPStack');
  }
}

export class CdkAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    
    const repository = new codecommit.Repository(this, 'MyJDPRepository', {
      repositoryName: 'MyJDPRepository'
    });
    
    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      selfMutation: true,
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.codeCommit(repository, 'master'),
        commands: [
          'npm ci',
          'npm run build',
          'npx cdk synth',
        ]
      }),
    });
    
    pipeline.addStage(new MyJDPApplication(this, 'Prod'));
  }
}
