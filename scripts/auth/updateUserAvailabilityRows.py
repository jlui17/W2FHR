import google_sheets
import cognito

AVAILABILITY_ROW_OFFSET = 3

ids_to_emails_map = google_sheets.get_ids_to_emails_map()
availability_employee_ids = google_sheets.get_availability_employee_ids()

for i in range(len(availability_employee_ids)):
    id = availability_employee_ids[i]
    email = ids_to_emails_map[id]
    availabilityRow = i + AVAILABILITY_ROW_OFFSET

    try:
        cognito.client.admin_update_user_attributes(UserAttributes=[{"Name": "custom:availabilityRow", "Value": str(availabilityRow)}], Username=email, UserPoolId=cognito.USER_POOL_ID)
    except Exception as e:
        print(f"[ERROR] {email} {e}")