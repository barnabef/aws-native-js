#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Pipeline } from '../lib/pipeline';

const app = new cdk.App();
new Pipeline(app, 'PipelineStack', {
    secretArn: "arn:aws:secretsmanager:ca-central-1:641225477653:secret:GitHub-TloOYa",
});
