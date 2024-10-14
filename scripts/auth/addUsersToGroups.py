import google_sheets
import cognito

def translate_sheets_position_to_cognito_group(sheetsPos: str) -> str:
    sheetsPos = sheetsPos.lower()
    if sheetsPos.__contains__("supervisor"):
        return "supervisors"
    if sheetsPos.__contains__("manager"):
        return "managers"
    return "attendants"

emails = set(google_sheets.get_emails())
emailToPositionMap = google_sheets.get_emails_to_positions_map()

cognitoUsers = cognito.get_users()

for cu in cognitoUsers:
    sheetsPos = emailToPositionMap[cu["email"]]
    group = translate_sheets_position_to_cognito_group(sheetsPos)

    cognito.client.admin_add_user_to_group(GroupName=group, Username=cu["email"], UserPoolId=cognito.USER_POOL_ID)
    
