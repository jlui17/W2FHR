import { Stack } from "aws-cdk-lib";
import {
  CloudFrontWebDistribution,
  OriginAccessIdentity,
} from "aws-cdk-lib/aws-cloudfront";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

export class FrontendService extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const siteBucket = new Bucket(this, "SiteBucket", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const oia = new OriginAccessIdentity(this, "OIA");
    siteBucket.grantRead(oia);

    const siteDistribution = new CloudFrontWebDistribution(
      this,
      "SiteDistribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: siteBucket,
              originAccessIdentity: oia,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
        errorConfigurations: [
          // redirect all 403 and 404 errors to index.html
          {
            errorCode: 403,
            responseCode: 200,
            responsePagePath: "/index.html",
          },
          {
            errorCode: 404,
            responseCode: 200,
            responsePagePath: "/index.html",
          },
        ],
        viewerCertificate: {
          aliases: ["employees.wun2free.com", "www.employees.wun2free.com"],
          props: {
            acmCertificateArn:
              "arn:aws:acm:us-east-1:268847659094:certificate/9d07d255-1fba-4718-a166-610c727b9777", // created manually, must be in us-east-1
            sslSupportMethod: "sni-only",
          },
        },
      }
    );

    const siteDeployment = new BucketDeployment(this, "SiteDeployment", {
      sources: [Source.asset("src/frontend/dist")],
      destinationBucket: siteBucket,
      distribution: siteDistribution,
      distributionPaths: ["/", "/index.html"], // Invalidate the cache for / and index.html when we deploy so that cloudfront serves latest site
    });
  }
}
