import cognito
import google_sheets
from google.oauth2 import service_account
from googleapiclient.discovery import build

sheetsUsers = set(google_sheets.get_employee_ids())
if "#N/A" in sheetsUsers:
    sheetsUsers.remove("#N/A")

cognitoUsers = cognito.get_users()

oldUsers = []
for cu in cognitoUsers:
    if cu["custom:employeeId"] not in sheetsUsers:
        oldUsers.append(cu)

for u in oldUsers:
    print("Deleting: " + str(u))
    cognito.client.admin_delete_user(UserPoolId=cognito.USER_POOL_ID, Username=u["sub"])
