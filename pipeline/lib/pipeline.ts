import * as cdk from '@aws-cdk/core';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions'
import * as codebuild from '@aws-cdk/aws-codebuild'
import * as secretsmanager from '@aws-cdk/aws-secretsmanager'
import * as iam from '@aws-cdk/aws-iam'

import s3 = require('@aws-cdk/aws-s3');
import {print} from "aws-cdk/lib/logging";
import {StackProps, Stack, Construct} from "@aws-cdk/core";

export interface PipelineStackProps extends StackProps {
  readonly secretArn: string;
}

export class Pipeline extends Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    const secret = secretsmanager.Secret.fromSecretArn(this, 'ImportedSecret', 'arn:aws:secretsmanager:ca-central-1:641225477653:secret:GitHub-TloOYa');
    const sourceOutput = new codepipeline.Artifact();

    const sourceAction = new codepipeline_actions.GitHubSourceAction({
      actionName: 'GitHub_Source',
      owner: secret.secretValueFromJson("owner").toString(),
      repo: secret.secretValueFromJson("repo").toString(),
      oauthToken: secret.secretValueFromJson("token"),
      output: sourceOutput,
      branch: secret.secretValueFromJson("branch").toString(), // default: 'master'
      trigger: codepipeline_actions.GitHubTrigger.WEBHOOK // default: 'WEBHOOK', 'NONE' is also possible for no Source trigger
    });

    const project = new codebuild.PipelineProject(this, 'BuildProject', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: [
              'cd app-infra',
              'npm install'
            ],
          },
          build: {
            commands: [
              'npm run build',
              'npm run cdk deploy'
            ],
          },
        },
      }),
    });

    project.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"))
    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'CodeBuild',
      project,
      input: sourceOutput,
    });
    const pipeline = new codepipeline.Pipeline(this, 'InfrastructurePipeline', {
      stages: [
        {
          stageName: 'Source',
          actions: [sourceAction],
        },
        {
          stageName: 'Build',
          actions: [buildAction],
        }
      ]
    });
  }
}
