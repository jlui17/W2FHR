package CognitoGroupAuthorizer

import (
	SharedConstants "GoogleSheets/packages/common/Constants"
	"log"
)

type cognitoGroupAuthorizer struct {
	level int
}

var (
	attendantUserGroupAuthorizer  cognitoGroupAuthorizer = cognitoGroupAuthorizer{level: 1}
	supervisorUserGroupAuthorizer cognitoGroupAuthorizer = cognitoGroupAuthorizer{level: 2}
	managerUserGroupAuthorizer    cognitoGroupAuthorizer = cognitoGroupAuthorizer{level: 3}
)

func New(group string) *cognitoGroupAuthorizer {
	switch group {
	case SharedConstants.SupervisorUserGroup:
		return &supervisorUserGroupAuthorizer
	case SharedConstants.ManagerUserGroup:
		return &managerUserGroupAuthorizer
	default:
		return &attendantUserGroupAuthorizer
	}
}

func (c *cognitoGroupAuthorizer) IsAuthorized(group string) bool {
	authorizedLevel := convertGroupToLevel(group)
	log.Printf("[INFO] Checking group (%s) and level (%d) against authorizer level %d", group, authorizedLevel, c.level)
	return authorizedLevel >= c.level
}

func convertGroupToLevel(group string) int {
	switch group {
	case SharedConstants.SupervisorUserGroup:
		return 2
	case SharedConstants.ManagerUserGroup:
		return 3
	default:
		return 1
	}
}
