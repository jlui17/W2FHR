package main

import (
	Scheduling "GoogleSheets/packages/scheduling/handlers"

	"github.com/aws/aws-lambda-go/lambda"
)

func main() {
	lambda.Start(Scheduling.HandleRequest)
}
