import google_sheets
import cognito

AVAILABILITY_ROW_OFFSET = 3

def update_availability_rows(user: dict[str, str], employee_id_to_availability_row_map: dict[str, int]):
    if user['custom:employeeId'] not in employee_id_to_availability_row_map:
        print(f"\n[DEBUG] UpdateAvailabilityRow - {email} {id} not in Availability Sheet. Deleting user...")
        cognito.delete_user(u['email'])
        return

    email = user['email']
    row = employee_id_to_availability_row_map[user['custom:employeeId']]
    try:
        cognito.client.admin_update_user_attributes(
            UserAttributes=[
                {
                    "Name": "custom:availabilityRow", 
                    "Value": str(row)
                }
            ], Username=email, UserPoolId=cognito.USER_POOL_ID)
        print(f"[SUCCESS] UpdateAvailabilityRow - {email} {row}")
    except Exception as e:
        print(f"\n[ERROR] UpdateAvailabilityRow - {email} {e}\n")

def actual_cognito_group(position: str):
    if 'supervisor' in position.lower():
        return 'supervisors'
    elif 'manager' in position.lower():
        return 'managers'
    else:
        return 'attendants'

def current_cognito_groups_for_user(email: str) -> list[str]:
    try:
        res = cognito.client.admin_list_groups_for_user(
            Username=email, UserPoolId=cognito.USER_POOL_ID
        )
        return list(map(lambda g: g['GroupName'], res['Groups']))
    except Exception as e:
        print(f"\n[ERROR] ListGroupsForUser - {email} {e}\n")
        return []

def update_groups(user: dict[str, str], emails_to_positions_map: dict[str, str]):
    email = user['email']
    if email not in emails_to_positions_map:
        print(f"\n[DEBUG] UpdateGroups - {email} not in Google Sheets Staff List. Deleting user...")
        cognito.delete_user(email)
        return

    position = emails_to_positions_map[email]
    current_groups = current_cognito_groups_for_user(email)
    actual_group = actual_cognito_group(position)

    try:
        cognito.client.admin_add_user_to_group(
            UserPoolId=cognito.USER_POOL_ID, Username=email, GroupName=actual_group)
        print(f"[SUCCESS] AddUserToGroup - {email} {actual_group}")
    except Exception as e:
        print(f"\n[ERROR] AddUserToGroup - {email} {e}\n")

    for group in current_groups:
        if group != actual_group:
            try:
                cognito.client.admin_remove_user_from_group(
                    UserPoolId=cognito.USER_POOL_ID, Username=email, GroupName=group)
            except Exception as e:
                print(f"\n[ERROR] RemoveUserFromGroup - {email} {e}\n")

emails_to_positions_map = google_sheets.get_emails_to_positions_map()
availability_employee_ids = google_sheets.get_availability_employee_ids()
cognito_users = cognito.get_users()

employee_id_to_availability_row_map = {}
for i in range(len(availability_employee_ids)):
    id = availability_employee_ids[i]
    employee_id_to_availability_row_map[id] = i + AVAILABILITY_ROW_OFFSET

for u in cognito_users:
    update_availability_rows(u, employee_id_to_availability_row_map )
    update_groups(u, emails_to_positions_map)
