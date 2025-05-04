package CognitoGroupAuthorizer

import (
	SharedConstants "GoogleSheets/packages/common/Constants"
	EmployeeInfo "GoogleSheets/packages/common/Utilities"
	"log"
	"slices"
)

type cognitoGroupAuthorizer struct {
	level int
}

var (
	attendantUserGroupAuthorizer  = cognitoGroupAuthorizer{level: 1}
	supervisorUserGroupAuthorizer = cognitoGroupAuthorizer{level: 2}
	managerUserGroupAuthorizer    = cognitoGroupAuthorizer{level: 3}

	employeesAuthorizedForScheduling = []string{"w2fnm230021", "w2fnm190025"}
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
	log.Printf("[INFO] Checking group (%s), level (%d) against authorizer level %d", group, authorizedLevel, c.level)
	return authorizedLevel >= c.level
}

func (c *cognitoGroupAuthorizer) IsAuthorizedForScheduling(employee *EmployeeInfo.EmployeeInfo) bool {
	return c.IsAuthorized(employee.Group) || slices.Contains(employeesAuthorizedForScheduling, employee.Id)
}

func convertGroupToLevel(group string) int {
	log.Printf("JUSLUI - %s", SharedConstants.ManagerUserGroup)
	switch group {
	case SharedConstants.SupervisorUserGroup:
		return 2
	case SharedConstants.ManagerUserGroup:
		return 3
	default:
		return 1
	}
}
