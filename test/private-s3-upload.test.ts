import { Template, Match } from "@aws-cdk/assertions";
import * as cdk from "@aws-cdk/core";
import * as PrivateS3Upload from "../lib/private-s3-upload-stack";

test("SQS Queue Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new PrivateS3Upload.PrivateS3UploadStack(app, "MyTestStack");
  // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::SQS::Queue", {
    VisibilityTimeout: 300,
  });
});

test("SNS Topic Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new PrivateS3Upload.PrivateS3UploadStack(app, "MyTestStack");
  // THEN
  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::SNS::Topic", 1);
});
