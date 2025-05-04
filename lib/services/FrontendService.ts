import { Stack } from "aws-cdk-lib";
import {
  Distribution,
  OriginAccessIdentity,
  AllowedMethods,
  CachedMethods,
  CachePolicy,
  ErrorResponse,
  OriginRequestPolicy,
  ViewerProtocolPolicy
} from "aws-cdk-lib/aws-cloudfront";
import { BlockPublicAccess, Bucket, IBucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";

export class FrontendService extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const siteBucket: IBucket = new Bucket(this, "SiteBucket", {
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const oia = new OriginAccessIdentity(this, "OIA");
    siteBucket.grantRead(oia);

    const domainCertificate = Certificate.fromCertificateArn(
      this,
      "SiteCertificate",
      "arn:aws:acm:us-east-1:268847659094:certificate/2ead05e3-e943-4404-bb96-92728cef12ae"
    );

    const errorResponses: ErrorResponse[] = [
      {
        httpStatus: 403,
        responseHttpStatus: 200,
        responsePagePath: "/index.html",
      },
      {
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: "/index.html",
      },
    ];

    // Create the distribution using the new Distribution class with S3 bucket as origin
    const siteDistribution = new Distribution(
      this,
      "SiteDistribution",
      {
        defaultBehavior: {
          origin: S3BucketOrigin.withOriginAccessIdentity(siteBucket, {
            originAccessIdentity: oia
          }),
          allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: CachedMethods.CACHE_GET_HEAD_OPTIONS,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          originRequestPolicy: OriginRequestPolicy.CORS_S3_ORIGIN,
          cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        },
        domainNames: ["w2f.justinlui.dev"],
        certificate: domainCertificate,
        errorResponses: errorResponses,
        defaultRootObject: "index.html",
      }
    );

    new BucketDeployment(this, "SiteDeployment", {
      sources: [Source.asset("src/frontend/dist")],
      destinationBucket: siteBucket,
      distribution: siteDistribution,
      distributionPaths: ["/", "/index.html"], // Invalidate the cache for / and index.html when we deploy so that cloudfront serves latest site
    });
  }
}
