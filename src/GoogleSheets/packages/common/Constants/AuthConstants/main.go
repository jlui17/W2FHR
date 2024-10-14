package AuthConstants

type VerifyResponse struct {
	Response string `json:"response"`
}

type SendCodeRequest struct {
	Username string `json:"username"`
}

type ConfirmCodeRequest struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

type LoginRequest struct {
	Email        string  `json:"email"`
	Password     string  `json:"password"`
	RefreshToken *string `json:"refreshToken,omitempty"`
}

type ResetPassword struct {
	Email    string `json:"email"`
	Code     string `json:"code"`
	Password string `json:"password"`
}
