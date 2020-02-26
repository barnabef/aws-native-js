import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { Pipeline } from '../lib/pipeline';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Pipeline(app, 'MyTestStack', {
        secretArn: "arn:aws:secretsmanager:ca-central-1:641225477653:secret:GitHub-TloOYa",
    });
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
