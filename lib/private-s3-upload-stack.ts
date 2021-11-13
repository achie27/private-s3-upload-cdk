import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as s3n from "@aws-cdk/aws-s3-notifications";
import * as lambda from "@aws-cdk/aws-lambda";
import * as sns from "@aws-cdk/aws-sns";
import * as snsSub from "@aws-cdk/aws-sns-subscriptions";
import * as apiGw from "@aws-cdk/aws-apigatewayv2";
import * as apiGwIn from "@aws-cdk/aws-apigatewayv2-integrations";

interface IPrivateS3UploadProps extends cdk.StackProps {
  serviceName: string;
  uploadNotificationEmail: string;
}

export class PrivateS3UploadStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: IPrivateS3UploadProps) {
    super(scope, id, props);

    // creates the private s3 bucket
    const imageUploadBucket = new s3.Bucket(
      this,
      `${props.serviceName}-s3-bucket`,
      {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
        publicReadAccess: false,
      }
    );

    // creates a lambda which returns a presigned url for objects to be uploaded to the above bucket
    const presignedUrlGetter = new lambda.Function(
      this,
      `${props.serviceName}-url-getter`,
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        code: lambda.Code.fromAsset("lambda"),
        handler: "s3Uploader.getPresignedUrl",
        environment: {
          DESTINATION_BUCKET: imageUploadBucket.bucketName,
        },
      }
    );

    // gives the lambda access to put objects in the bucket
    imageUploadBucket.grantPut(presignedUrlGetter);

    // creates a new sns topic and subscribes the provided email to receive its events
    const snsTopic = new sns.Topic(this, `${props.serviceName}-sns-topic`);
    snsTopic.addSubscription(
      new snsSub.EmailSubscription(props.uploadNotificationEmail)
    );

    // pipes all object creation events to the above created sns topic
    imageUploadBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SnsDestination(snsTopic)
    );

    // creates an http api for clients/3rd parties to interact with
    const theApi = new apiGw.HttpApi(this, `${props.serviceName}-http-api`);

    // wraps the lambda with the endpoint
    theApi.addRoutes({
      path: "/getPresignedUrl",
      methods: [apiGw.HttpMethod.GET],
      integration: new apiGwIn.LambdaProxyIntegration({
        handler: presignedUrlGetter,
      }),
    });

    new cdk.CfnOutput(this, 'TheAPI', { value: theApi.apiEndpoint });
    new cdk.CfnOutput(this, 'TheBucket', { value: imageUploadBucket.bucketName });
  }
}
