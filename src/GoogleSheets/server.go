package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	Auth "GoogleSheets/packages/auth/handlers"
	Availability "GoogleSheets/packages/availability/handlers"
	SharedConstants "GoogleSheets/packages/common/Constants"
	Schedule "GoogleSheets/packages/schedule/handlers"
	Scheduling "GoogleSheets/packages/scheduling/handlers"

	"github.com/aws/aws-lambda-go/events"
)

// handlerFunc defines the signature of AWS Lambda handler functions
type handlerFunc func(context.Context, events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error)

// handlerMapping maps API paths to their respective handler functions
var handlerMapping = map[string]handlerFunc{
	"/availability": Availability.HandleRequest,
	"/auth":         Auth.HandleRequest,
	"/timesheet":    Schedule.HandleRequest,
	"/scheduling":   Scheduling.HandleRequest,
}

// convertToAPIGatewayRequest converts an http.Request to an events.APIGatewayProxyRequest
func convertToAPIGatewayRequest(r *http.Request) events.APIGatewayProxyRequest {
	// Read the request body
	var body []byte
	if r.Body != nil {
		var err error
		body, err = io.ReadAll(r.Body)
		if err != nil {
			log.Printf("Error reading body: %v", err)
			body = []byte{}
		}
		defer r.Body.Close()

		// Log the raw request body for debugging
		log.Printf("Request body: %s", string(body))
	} else {
		body = []byte{}
	}

	// Extract headers
	headers := make(map[string]string)
	for key, values := range r.Header {
		if len(values) > 0 {
			headers[key] = values[0]
		}
	}

	// Extract query parameters
	queryParams := make(map[string]string)
	for key, values := range r.URL.Query() {
		if len(values) > 0 {
			queryParams[key] = values[0]
		}
	}

	// Determine the resource path (API Gateway pattern)
	resourcePath := r.URL.Path
	pathParts := strings.SplitN(r.URL.Path, "/", 3)
	if len(pathParts) > 1 {
		resourcePath = "/" + pathParts[1]
		if len(pathParts) > 2 {
			resourcePath += "/" + strings.Split(pathParts[2], "/")[0]
		}
	}

	return events.APIGatewayProxyRequest{
		Resource:              resourcePath,
		Path:                  r.URL.Path,
		HTTPMethod:            r.Method,
		Headers:               headers,
		QueryStringParameters: queryParams,
		Body:                  string(body),
		IsBase64Encoded:       false,
	}
}

// handleRequest handles HTTP requests by routing them to appropriate lambda handlers
// setCorsHeaders sets CORS headers to allow any origin
func setCorsHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Access-Control-Max-Age", "3600")
}

func handleRequest(w http.ResponseWriter, r *http.Request) {
	log.Printf("\n\nReceived request: %v\n\n", r)

	// Set CORS headers for all responses
	setCorsHeaders(w)

	// Handle preflight OPTIONS request
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Determine which handler to use based on the path
	var handler handlerFunc
	var handlerPath string

	// Find the matching handler for the request path
	for path, h := range handlerMapping {
		if strings.HasPrefix(r.URL.Path, path) {
			handler = h
			handlerPath = path
			break
		}
	}

	if handler == nil {
		log.Printf("No handler found for path: %s", r.URL.Path)
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprintf(w, "Not found: %s", r.URL.Path)
		return
	}

	log.Printf("Using handler for path: %s", handlerPath)

	// Convert the HTTP request to an API Gateway proxy request
	apiGatewayRequest := convertToAPIGatewayRequest(r)

	// Create a context
	ctx := context.Background()

	// Call the lambda handler
	response, err := handler(ctx, apiGatewayRequest)
	if err != nil {
		log.Printf("Handler error: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "Internal server error: %v", err)
		return
	}

	// Set response headers
	for key, value := range response.Headers {
		w.Header().Set(key, value)
	}

	// Set status code
	w.WriteHeader(response.StatusCode)

	// Write response body
	fmt.Fprint(w, response.Body)
}

// loadEnvVars loads the Google service account config JSON from .env file
func loadEnvVars() error {
	// Read the .env file
	data, err := os.ReadFile(".env")
	if err != nil {
		return fmt.Errorf("error reading .env file: %w", err)
	}

	// Split by lines
	lines := strings.Split(string(data), "\n")

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}

		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])
		switch key {
		case "G_SERVICE_CONFIG_JSON":
			os.Setenv(key, value)
		case SharedConstants.COGNITO_ATTENDANTS_GROUP_ENV_KEY:
			SharedConstants.AttendantUserGroup = value
		case SharedConstants.COGNITO_MANAGERS_GROUP_ENV_KEY:
			SharedConstants.ManagerUserGroup = value
		case SharedConstants.COGNITO_SUPERVISORS_GROUP_ENV_KEY:
			SharedConstants.SupervisorUserGroup = value
		default:
			return fmt.Errorf("unknown environment variable: %s", key)
		}
		log.Printf("Successfully loaded env var - key: %s, value: %s", key, value)
	}

	return nil
}

func main() {
	// Load Google service account config JSON from .env file at runtime
	err := loadEnvVars()
	if err != nil {
		return
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/", handleRequest)

	log.Printf("Starting server on port %s...", port)
	log.Printf("Available endpoints:")
	for path := range handlerMapping {
		log.Printf("  %s", path)
	}

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
