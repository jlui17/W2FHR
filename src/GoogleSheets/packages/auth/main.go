package main

import (
	Authorization "GoogleSheets/packages/auth/handlers"

	"github.com/aws/aws-lambda-go/lambda"
)

func main() {
	lambda.Start(Authorization.HandleRequest)
}
