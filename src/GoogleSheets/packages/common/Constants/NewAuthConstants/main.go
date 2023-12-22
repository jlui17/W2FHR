package NewAuthConstants

type SignUpRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SignUpResponse struct {
	NeedsConfirmation bool `json:"needsConfirmation"`
}
