import * as cdk from '@aws-cdk/core';
import * as s3  from '@aws-cdk/aws-s3';
import * as lambda  from '@aws-cdk/aws-lambda';
import * as apiGw from '@aws-cdk/aws-apigatewayv2';
import * as apiGwIn from '@aws-cdk/aws-apigatewayv2-integrations';

export class PrivateS3UploadStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const driversLicenseBucket = new s3.Bucket(this, 'DriversLicenses', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publicReadAccess: false
    })

    const presignedUrlGetter = new lambda.Function(this, 'DriversLicensePresignedUrlGetter', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 's3Uploader.getPresignedUrl',
      environment: {
        DESTINATION_BUCKET: driversLicenseBucket.bucketName
      }
    });

    driversLicenseBucket.grantPut(presignedUrlGetter);
    driversLicenseBucket.grantPutAcl(presignedUrlGetter);

    const theApi = new apiGw.HttpApi(this, 'licenseApi', {
      apiName: 'Drivers License Upload'
    });

    const urlGetterEndpoint = theApi.addRoutes({
      path: '/getPresignedUrl',
      methods: [apiGw.HttpMethod.GET],
      integration: new apiGwIn.LambdaProxyIntegration({
        handler: presignedUrlGetter
      })
    });
  }
}
