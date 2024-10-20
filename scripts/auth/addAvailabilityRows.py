import google_sheets
import cognito

ids = google_sheets.get_availability_employee_ids_col()
idsToEmailsMap = google_sheets.get_ids_to_emails_map()

for i in range(len(ids)):
    id = ids[i]
    if not id in idsToEmailsMap:
        continue

    email = idsToEmailsMap[id]
    availabilityRowAttribute = {
        "Name": "custom:availabilityRow",
        "Value": str(i + 1)
    }
    try:
        print(email)
        cognito.client.admin_update_user_attributes(
            UserPoolId=cognito.USER_POOL_ID,
            Username=email,
            UserAttributes=[availabilityRowAttribute]
        )
    except cognito.ClientError as err:
        # we want to continue and debug later
        print(email, err)
