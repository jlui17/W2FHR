package main

import (
	Availability "GoogleSheets/packages/availability/handlers"

	"github.com/aws/aws-lambda-go/lambda"
)

func main() {
	lambda.Start(Availability.HandleRequest)
}
