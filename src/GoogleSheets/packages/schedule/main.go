package main

import (
	Schedule "GoogleSheets/packages/schedule/handlers"

	"github.com/aws/aws-lambda-go/lambda"
)

func main() {
	lambda.Start(Schedule.HandleRequest)
}
