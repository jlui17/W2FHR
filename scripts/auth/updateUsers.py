import google_sheets
import cognito

AVAILABILITY_ROW_OFFSET = 3

ids_to_emails_map = google_sheets.get_ids_to_emails_map()
emails_to_positions_map = google_sheets.get_emails_to_positions_map()
availability_employee_ids = google_sheets.get_availability_employee_ids()


def update_availability_rows():
    for i in range(len(availability_employee_ids)):
        id = availability_employee_ids[i]
        email = ids_to_emails_map[id]
        availabilityRow = i + AVAILABILITY_ROW_OFFSET

        try:
            cognito.client.admin_update_user_attributes(
                UserAttributes=[
                    {
                        "Name": "custom:availabilityRow", 
                        "Value": str(availabilityRow)
                    }
                ], Username=email, UserPoolId=cognito.USER_POOL_ID)
        except Exception as e:
            print(f"[ERROR] UpdateAvailabilityRow - {email} {e}")

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
        print(f"[ERROR] ListGroupsForUser - {email} {e}")
        return []

def update_groups():
    for i in range(len(availability_employee_ids)):
        id = availability_employee_ids[i]
        email = ids_to_emails_map[id]
        position = emails_to_positions_map[email]
        current_groups = current_cognito_groups_for_user(email)
        actual_group = actual_cognito_group(position)

        try:
            cognito.client.admin_add_user_to_group(
                UserPoolId=cognito.USER_POOL_ID, Username=email, GroupName=actual_group)
        except Exception as e:
            print(f"[ERROR] AddUserToGroup - {email} {e}")

        for group in current_groups:
            if group != actual_group:
                try:
                    cognito.client.admin_remove_user_from_group(
                        UserPoolId=cognito.USER_POOL_ID, Username=email, GroupName=group)
                except Exception as e:
                    print(f"[ERROR] RemoveUserFromGroup - {email} {e}")

update_availability_rows()
update_groups()