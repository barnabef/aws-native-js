#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Pipeline } from '../lib/pipeline';

const app = new cdk.App();
new Pipeline(app, 'PipelineStack', {
    githubRepo: "aws-native-js",
    githubOwner: "barnabef"
});
