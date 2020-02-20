import * as cdk from '@aws-cdk/core';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions'
import * as codebuild from '@aws-cdk/aws-codebuild'
import * as secretsmanager from '@aws-cdk/aws-secretsmanager'

import s3 = require('@aws-cdk/aws-s3');
import {print} from "aws-cdk/lib/logging";

export class Pipeline extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // new s3.Bucket(this, 'MyFirstBucket', {
    //   versioned: true,
    // });
    const pipeline = new codepipeline.Pipeline(this, 'InfrastructurePipeline');
    // Read the secret from Secrets Manager

    const secret = secretsmanager.Secret.fromSecretArn(this, 'ImportedSecret', 'arn:aws:secretsmanager:ca-central-1:641225477653:secret:GitHub-TloOYa');
    const sourceOutput = new codepipeline.Artifact();

    const sourceAction = new codepipeline_actions.GitHubSourceAction({
      actionName: 'GitHub_Source',
      owner: 'barnabef',
      repo: 'aws-native-js',
      oauthToken: secret.secretValueFromJson("my-github-token"),
      output: sourceOutput,
      branch: 'master', // default: 'master'
      trigger: codepipeline_actions.GitHubTrigger.WEBHOOK // default: 'WEBHOOK', 'NONE' is also possible for no Source trigger
    });
    pipeline.addStage({
      stageName: 'Source',
      actions: [sourceAction],
    });

    const project = new codebuild.PipelineProject(this, 'BuildProject', {
      // buildSpec: codebuild.BuildSpec.fromSourceFilename("pipeline/buildspec.yml")
    });
    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CodeBuild',
      project,
      input: sourceOutput,

      outputs: [new codepipeline.Artifact()], // optional
    });
    pipeline.addStage({
      stageName: 'Build',
      actions: [buildAction],
    });



  }
}
