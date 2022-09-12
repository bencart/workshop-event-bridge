import * as cdk from '@aws-cdk/core'
import * as AmplifyHelpers from '@aws-amplify/cli-extensibility-helper'
import { AmplifyDependentResourcesAttributes } from '../../types/amplify-dependent-resources-ref'
import * as events from '@aws-cdk/aws-events'
import * as targets from '@aws-cdk/aws-events-targets'
import * as lambda from '@aws-cdk/aws-lambda'
import * as iam from '@aws-cdk/aws-iam'

export class cdkStack extends cdk.Stack {
    constructor(
        scope: cdk.Construct,
        id: string,
        props?: cdk.StackProps,
        amplifyResourceProps?: AmplifyHelpers.AmplifyResourceProps
    ) {
        super(scope, id, props)
        /* Do not remove - Amplify CLI automatically injects the current deployment environment in this input parameter */
        new cdk.CfnParameter(this, 'env', {
            type: 'String',
            description: 'Current Amplify CLI env name',
        })

        const rule = new events.Rule(this, 'consumedEvent', {
            eventPattern: {
                detailType: ['p33.consumed.event'],
            },
        })

        //grab a reference to our Amplify function
        const retVal: AmplifyDependentResourcesAttributes =
        AmplifyHelpers.addResourceDependency(
          this,
          amplifyResourceProps.category,
          amplifyResourceProps.resourceName,
          [{ category: 'function', resourceName: 'eventbridgeapp2482d011' }]
      )

        const eventbridgeapp2482d011 = lambda.Function.fromFunctionArn(
            this,
            'eventbridgeapp2482d011',
            //when the app synthesizes, grab the actual ARN of the function
            cdk.Fn.ref(retVal.function.eventbridgeapp2482d011.Arn)
        )

        // add this rule to the default event bus
        rule.addTarget(new targets.LambdaFunction(eventbridgeapp2482d011));

        let action = "lambda:InvokeFunction"
        let principal = "events.amazonaws.com"
        let sourceArn = rule.ruleArn
        let functionName = eventbridgeapp2482d011.functionArn

        let permission = new lambda.CfnPermission(this, 'invoke-from-eb', {
          action,
          functionName,
          principal,
          sourceArn
        });
    }
}