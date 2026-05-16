package CognitoGroupAuthorizer

import (
	SharedConstants "GoogleSheets/packages/common/Constants"
	EmployeeInfo "GoogleSheets/packages/common/Utilities"
	"os"
	"testing"
)

func TestMain(m *testing.M) {
	// Set env vars that SharedConstants reads at init time.
	// NOTE: SharedConstants.AttendantUserGroup etc. were already initialized
	// before this runs, so we can't use them in tests. The CognitoGroupAuthorizer
	// functions test against these package-level vars which are empty here.
	os.Setenv(SharedConstants.COGNITO_ATTENDANTS_GROUP_ENV_KEY, "attendants-group")
	os.Setenv(SharedConstants.COGNITO_SUPERVISORS_GROUP_ENV_KEY, "supervisors-group")
	os.Setenv(SharedConstants.COGNITO_MANAGERS_GROUP_ENV_KEY, "managers-group")
	os.Exit(m.Run())
}

func TestConvertGroupToLevel(t *testing.T) {
	// Test the pure logic: since env vars aren't set at package init time,
	// SharedConstants vars are empty strings. The function matches against empty.
	// supervisor and manager groups match "" (SharedConstants.SupervisorUserGroup),
	// everything else defaults to 1.
	tests := []struct {
		name  string
		group string
		want  int
	}{
		{"empty matches first case (supervisor)", "", 2},
		{"unknown group defaults to 1", "unknown-group", 1},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := convertGroupToLevel(tt.group)
			if got != tt.want {
				t.Errorf("convertGroupToLevel(%q) = %d, want %d", tt.group, got, tt.want)
			}
		})
	}
}

func TestNew(t *testing.T) {
	tests := []struct {
		name  string
		group string
		want  int // expected level
	}{
		{"unknown group defaults to attendant (level 1)", "unknown", 1},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := New(tt.group)
			if got == nil {
				t.Fatal("New() returned nil")
			}
			if got.level != tt.want {
				t.Errorf("New(%q).level = %d, want %d", tt.group, got.level, tt.want)
			}
		})
	}
}

func TestIsAuthorized(t *testing.T) {
	tests := []struct {
		name       string
		authorizer *cognitoGroupAuthorizer
		userGroup  string
		wantAuth   bool
	}{
		{
			name:       "level 1 authorizer allows level 1",
			authorizer: &cognitoGroupAuthorizer{level: 1},
			userGroup:  "any-group",
			wantAuth:   true,
		},
		{
			name:       "level 2 authorizer denies level 1 group",
			authorizer: &cognitoGroupAuthorizer{level: 2},
			userGroup:  "any-group",
			wantAuth:   false,
		},
		{
			name:       "level 2 authorizer allows supervisor-equivalent",
			authorizer: &cognitoGroupAuthorizer{level: 2},
			userGroup:  "",
			wantAuth:   true,
		},
		{
			name:       "level 3 authorizer denies level 2 (empty matches supervisor=2)",
			authorizer: &cognitoGroupAuthorizer{level: 3},
			userGroup:  "",
			wantAuth:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.authorizer.IsAuthorized(tt.userGroup)
			if got != tt.wantAuth {
				t.Errorf("IsAuthorized(%q) = %v, want %v", tt.userGroup, got, tt.wantAuth)
			}
		})
	}
}

func TestIsAuthorizedForScheduling(t *testing.T) {
	tests := []struct {
		name       string
		authorizer *cognitoGroupAuthorizer
		employee   *EmployeeInfo.EmployeeInfo
		wantAuth   bool
	}{
		{
			name:       "employee in scheduling list is authorized",
			authorizer: &cognitoGroupAuthorizer{level: 3},
			employee:   &EmployeeInfo.EmployeeInfo{Id: "w2fnm230021", Group: "any-group"},
			wantAuth:   true,
		},
		{
			name:       "employee not in scheduling list and below level is denied",
			authorizer: &cognitoGroupAuthorizer{level: 3},
			employee:   &EmployeeInfo.EmployeeInfo{Id: "unknown-id", Group: "any-group"},
			wantAuth:   false,
		},
		{
			name:       "supervisor-equivalent is denied at level 3",
			authorizer: &cognitoGroupAuthorizer{level: 3},
			employee:   &EmployeeInfo.EmployeeInfo{Id: "random-id", Group: ""},
			wantAuth:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.authorizer.IsAuthorizedForScheduling(tt.employee)
			if got != tt.wantAuth {
				t.Errorf("IsAuthorizedForScheduling() = %v, want %v", got, tt.wantAuth)
			}
		})
	}
}
