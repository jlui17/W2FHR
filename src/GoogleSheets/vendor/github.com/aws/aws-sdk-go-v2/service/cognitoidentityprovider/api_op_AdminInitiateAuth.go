// Code generated by smithy-go-codegen DO NOT EDIT.

package cognitoidentityprovider

import (
	"context"
	"fmt"
	awsmiddleware "github.com/aws/aws-sdk-go-v2/aws/middleware"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
	"github.com/aws/smithy-go/middleware"
	smithyhttp "github.com/aws/smithy-go/transport/http"
)

// Initiates the authentication flow, as an administrator. This action might
// generate an SMS text message. Starting June 1, 2021, US telecom carriers require
// you to register an origination phone number before you can send SMS messages to
// US phone numbers. If you use SMS text messages in Amazon Cognito, you must
// register a phone number with Amazon Pinpoint (https://console.aws.amazon.com/pinpoint/home/)
// . Amazon Cognito uses the registered number automatically. Otherwise, Amazon
// Cognito users who must receive SMS messages might not be able to sign up,
// activate their accounts, or sign in. If you have never used SMS text messages
// with Amazon Cognito or any other Amazon Web Service, Amazon Simple Notification
// Service might place your account in the SMS sandbox. In sandbox mode (https://docs.aws.amazon.com/sns/latest/dg/sns-sms-sandbox.html)
// , you can send messages only to verified phone numbers. After you test your app
// while in the sandbox environment, you can move out of the sandbox and into
// production. For more information, see SMS message settings for Amazon Cognito
// user pools (https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-sms-settings.html)
// in the Amazon Cognito Developer Guide. Amazon Cognito evaluates Identity and
// Access Management (IAM) policies in requests for this API operation. For this
// operation, you must use IAM credentials to authorize requests, and you must
// grant yourself the corresponding IAM permission in a policy. Learn more
//   - Signing Amazon Web Services API Requests (https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_aws-signing.html)
//   - Using the Amazon Cognito user pools API and user pool endpoints (https://docs.aws.amazon.com/cognito/latest/developerguide/user-pools-API-operations.html)
func (c *Client) AdminInitiateAuth(ctx context.Context, params *AdminInitiateAuthInput, optFns ...func(*Options)) (*AdminInitiateAuthOutput, error) {
	if params == nil {
		params = &AdminInitiateAuthInput{}
	}

	result, metadata, err := c.invokeOperation(ctx, "AdminInitiateAuth", params, optFns, c.addOperationAdminInitiateAuthMiddlewares)
	if err != nil {
		return nil, err
	}

	out := result.(*AdminInitiateAuthOutput)
	out.ResultMetadata = metadata
	return out, nil
}

// Initiates the authorization request, as an administrator.
type AdminInitiateAuthInput struct {

	// The authentication flow for this call to run. The API action will depend on
	// this value. For example:
	//   - REFRESH_TOKEN_AUTH will take in a valid refresh token and return new tokens.
	//   - USER_SRP_AUTH will take in USERNAME and SRP_A and return the Secure Remote
	//   Password (SRP) protocol variables to be used for next challenge execution.
	//   - ADMIN_USER_PASSWORD_AUTH will take in USERNAME and PASSWORD and return the
	//   next challenge or tokens.
	// Valid values include:
	//   - USER_SRP_AUTH : Authentication flow for the Secure Remote Password (SRP)
	//   protocol.
	//   - REFRESH_TOKEN_AUTH / REFRESH_TOKEN : Authentication flow for refreshing the
	//   access token and ID token by supplying a valid refresh token.
	//   - CUSTOM_AUTH : Custom authentication flow.
	//   - ADMIN_NO_SRP_AUTH : Non-SRP authentication flow; you can pass in the
	//   USERNAME and PASSWORD directly if the flow is enabled for calling the app
	//   client.
	//   - ADMIN_USER_PASSWORD_AUTH : Admin-based user password authentication. This
	//   replaces the ADMIN_NO_SRP_AUTH authentication flow. In this flow, Amazon
	//   Cognito receives the password in the request instead of using the SRP process to
	//   verify passwords.
	//
	// This member is required.
	AuthFlow types.AuthFlowType

	// The app client ID.
	//
	// This member is required.
	ClientId *string

	// The ID of the Amazon Cognito user pool.
	//
	// This member is required.
	UserPoolId *string

	// The analytics metadata for collecting Amazon Pinpoint metrics for
	// AdminInitiateAuth calls.
	AnalyticsMetadata *types.AnalyticsMetadataType

	// The authentication parameters. These are inputs corresponding to the AuthFlow
	// that you're invoking. The required values depend on the value of AuthFlow :
	//   - For USER_SRP_AUTH : USERNAME (required), SRP_A (required), SECRET_HASH
	//   (required if the app client is configured with a client secret), DEVICE_KEY .
	//   - For ADMIN_USER_PASSWORD_AUTH : USERNAME (required), PASSWORD (required),
	//   SECRET_HASH (required if the app client is configured with a client secret),
	//   DEVICE_KEY .
	//   - For REFRESH_TOKEN_AUTH/REFRESH_TOKEN : REFRESH_TOKEN (required), SECRET_HASH
	//   (required if the app client is configured with a client secret), DEVICE_KEY .
	//   - For CUSTOM_AUTH : USERNAME (required), SECRET_HASH (if app client is
	//   configured with client secret), DEVICE_KEY . To start the authentication flow
	//   with password verification, include ChallengeName: SRP_A and SRP_A: (The
	//   SRP_A Value) .
	// For more information about SECRET_HASH , see Computing secret hash values (https://docs.aws.amazon.com/cognito/latest/developerguide/signing-up-users-in-your-app.html#cognito-user-pools-computing-secret-hash)
	// . For information about DEVICE_KEY , see Working with user devices in your user
	// pool (https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-device-tracking.html)
	// .
	AuthParameters map[string]string

	// A map of custom key-value pairs that you can provide as input for certain
	// custom workflows that this action triggers. You create custom workflows by
	// assigning Lambda functions to user pool triggers. When you use the
	// AdminInitiateAuth API action, Amazon Cognito invokes the Lambda functions that
	// are specified for various triggers. The ClientMetadata value is passed as input
	// to the functions for only the following triggers:
	//   - Pre signup
	//   - Pre authentication
	//   - User migration
	// When Amazon Cognito invokes the functions for these triggers, it passes a JSON
	// payload, which the function receives as input. This payload contains a
	// validationData attribute, which provides the data that you assigned to the
	// ClientMetadata parameter in your AdminInitiateAuth request. In your function
	// code in Lambda, you can process the validationData value to enhance your
	// workflow for your specific needs. When you use the AdminInitiateAuth API action,
	// Amazon Cognito also invokes the functions for the following triggers, but it
	// doesn't provide the ClientMetadata value as input:
	//   - Post authentication
	//   - Custom message
	//   - Pre token generation
	//   - Create auth challenge
	//   - Define auth challenge
	// For more information, see  Customizing user pool Workflows with Lambda Triggers (https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html)
	// in the Amazon Cognito Developer Guide. When you use the ClientMetadata
	// parameter, remember that Amazon Cognito won't do the following:
	//   - Store the ClientMetadata value. This data is available only to Lambda
	//   triggers that are assigned to a user pool to support custom workflows. If your
	//   user pool configuration doesn't include triggers, the ClientMetadata parameter
	//   serves no purpose.
	//   - Validate the ClientMetadata value.
	//   - Encrypt the ClientMetadata value. Don't use Amazon Cognito to provide
	//   sensitive information.
	ClientMetadata map[string]string

	// Contextual data about your user session, such as the device fingerprint, IP
	// address, or location. Amazon Cognito advanced security evaluates the risk of an
	// authentication event based on the context that your app generates and passes to
	// Amazon Cognito when it makes API requests.
	ContextData *types.ContextDataType

	noSmithyDocumentSerde
}

// Initiates the authentication response, as an administrator.
type AdminInitiateAuthOutput struct {

	// The result of the authentication response. This is only returned if the caller
	// doesn't need to pass another challenge. If the caller does need to pass another
	// challenge before it gets tokens, ChallengeName , ChallengeParameters , and
	// Session are returned.
	AuthenticationResult *types.AuthenticationResultType

	// The name of the challenge that you're responding to with this call. This is
	// returned in the AdminInitiateAuth response if you must pass another challenge.
	//   - MFA_SETUP : If MFA is required, users who don't have at least one of the MFA
	//   methods set up are presented with an MFA_SETUP challenge. The user must set up
	//   at least one MFA type to continue to authenticate.
	//   - SELECT_MFA_TYPE : Selects the MFA type. Valid MFA options are SMS_MFA for
	//   text SMS MFA, and SOFTWARE_TOKEN_MFA for time-based one-time password (TOTP)
	//   software token MFA.
	//   - SMS_MFA : Next challenge is to supply an SMS_MFA_CODE , delivered via SMS.
	//   - PASSWORD_VERIFIER : Next challenge is to supply PASSWORD_CLAIM_SIGNATURE ,
	//   PASSWORD_CLAIM_SECRET_BLOCK , and TIMESTAMP after the client-side SRP
	//   calculations.
	//   - CUSTOM_CHALLENGE : This is returned if your custom authentication flow
	//   determines that the user should pass another challenge before tokens are issued.
	//
	//   - DEVICE_SRP_AUTH : If device tracking was activated in your user pool and the
	//   previous challenges were passed, this challenge is returned so that Amazon
	//   Cognito can start tracking this device.
	//   - DEVICE_PASSWORD_VERIFIER : Similar to PASSWORD_VERIFIER , but for devices
	//   only.
	//   - ADMIN_NO_SRP_AUTH : This is returned if you must authenticate with USERNAME
	//   and PASSWORD directly. An app client must be enabled to use this flow.
	//   - NEW_PASSWORD_REQUIRED : For users who are required to change their passwords
	//   after successful first login. Respond to this challenge with NEW_PASSWORD and
	//   any required attributes that Amazon Cognito returned in the requiredAttributes
	//   parameter. You can also set values for attributes that aren't required by your
	//   user pool and that your app client can write. For more information, see
	//   AdminRespondToAuthChallenge (https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminRespondToAuthChallenge.html)
	//   . In a NEW_PASSWORD_REQUIRED challenge response, you can't modify a required
	//   attribute that already has a value. In AdminRespondToAuthChallenge , set a
	//   value for any keys that Amazon Cognito returned in the requiredAttributes
	//   parameter, then use the AdminUpdateUserAttributes API operation to modify the
	//   value of any additional attributes.
	//   - MFA_SETUP : For users who are required to set up an MFA factor before they
	//   can sign in. The MFA types activated for the user pool will be listed in the
	//   challenge parameters MFAS_CAN_SETUP value. To set up software token MFA, use
	//   the session returned here from InitiateAuth as an input to
	//   AssociateSoftwareToken , and use the session returned by VerifySoftwareToken
	//   as an input to RespondToAuthChallenge with challenge name MFA_SETUP to
	//   complete sign-in. To set up SMS MFA, users will need help from an administrator
	//   to add a phone number to their account and then call InitiateAuth again to
	//   restart sign-in.
	ChallengeName types.ChallengeNameType

	// The challenge parameters. These are returned to you in the AdminInitiateAuth
	// response if you must pass another challenge. The responses in this parameter
	// should be used to compute inputs to the next call ( AdminRespondToAuthChallenge
	// ). All challenges require USERNAME and SECRET_HASH (if applicable). The value
	// of the USER_ID_FOR_SRP attribute is the user's actual username, not an alias
	// (such as email address or phone number), even if you specified an alias in your
	// call to AdminInitiateAuth . This happens because, in the
	// AdminRespondToAuthChallenge API ChallengeResponses , the USERNAME attribute
	// can't be an alias.
	ChallengeParameters map[string]string

	// The session that should be passed both ways in challenge-response calls to the
	// service. If AdminInitiateAuth or AdminRespondToAuthChallenge API call
	// determines that the caller must pass another challenge, they return a session
	// with other challenge parameters. This session should be passed as it is to the
	// next AdminRespondToAuthChallenge API call.
	Session *string

	// Metadata pertaining to the operation's result.
	ResultMetadata middleware.Metadata

	noSmithyDocumentSerde
}

func (c *Client) addOperationAdminInitiateAuthMiddlewares(stack *middleware.Stack, options Options) (err error) {
	if err := stack.Serialize.Add(&setOperationInputMiddleware{}, middleware.After); err != nil {
		return err
	}
	err = stack.Serialize.Add(&awsAwsjson11_serializeOpAdminInitiateAuth{}, middleware.After)
	if err != nil {
		return err
	}
	err = stack.Deserialize.Add(&awsAwsjson11_deserializeOpAdminInitiateAuth{}, middleware.After)
	if err != nil {
		return err
	}
	if err := addProtocolFinalizerMiddlewares(stack, options, "AdminInitiateAuth"); err != nil {
		return fmt.Errorf("add protocol finalizers: %v", err)
	}

	if err = addlegacyEndpointContextSetter(stack, options); err != nil {
		return err
	}
	if err = addSetLoggerMiddleware(stack, options); err != nil {
		return err
	}
	if err = addClientRequestID(stack); err != nil {
		return err
	}
	if err = addComputeContentLength(stack); err != nil {
		return err
	}
	if err = addResolveEndpointMiddleware(stack, options); err != nil {
		return err
	}
	if err = addComputePayloadSHA256(stack); err != nil {
		return err
	}
	if err = addRetry(stack, options); err != nil {
		return err
	}
	if err = addRawResponseToMetadata(stack); err != nil {
		return err
	}
	if err = addRecordResponseTiming(stack); err != nil {
		return err
	}
	if err = addClientUserAgent(stack, options); err != nil {
		return err
	}
	if err = smithyhttp.AddErrorCloseResponseBodyMiddleware(stack); err != nil {
		return err
	}
	if err = smithyhttp.AddCloseResponseBodyMiddleware(stack); err != nil {
		return err
	}
	if err = addSetLegacyContextSigningOptionsMiddleware(stack); err != nil {
		return err
	}
	if err = addOpAdminInitiateAuthValidationMiddleware(stack); err != nil {
		return err
	}
	if err = stack.Initialize.Add(newServiceMetadataMiddleware_opAdminInitiateAuth(options.Region), middleware.Before); err != nil {
		return err
	}
	if err = addRecursionDetection(stack); err != nil {
		return err
	}
	if err = addRequestIDRetrieverMiddleware(stack); err != nil {
		return err
	}
	if err = addResponseErrorMiddleware(stack); err != nil {
		return err
	}
	if err = addRequestResponseLogging(stack, options); err != nil {
		return err
	}
	if err = addDisableHTTPSMiddleware(stack, options); err != nil {
		return err
	}
	return nil
}

func newServiceMetadataMiddleware_opAdminInitiateAuth(region string) *awsmiddleware.RegisterServiceMetadata {
	return &awsmiddleware.RegisterServiceMetadata{
		Region:        region,
		ServiceID:     ServiceID,
		OperationName: "AdminInitiateAuth",
	}
}