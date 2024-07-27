from google.oauth2 import service_account
from googleapiclient.discovery import build
import exportUsers
import google_sheets
import cognito

sheetsUsers = set(google_sheets.get_employee_ids)
sheetsUsers.remove("#N/A")

cognitoUsers = exportUsers.list_users()

oldUsers = []
for cu in cognitoUsers:
    if not cu["custom:employeeId"] in sheetsUsers:
        oldUsers.append(cu)

for u in oldUsers:
    print("Deleting: " + str(u))
    cognito.client.admin_delete_user(
        UserPoolId=exportUsers.USER_POOL_ID,
        Username=u["sub"]
    )
