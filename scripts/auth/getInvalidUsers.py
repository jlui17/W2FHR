import google_sheets
import cognito

sheets_email_to_id_map = google_sheets.get_emails_to_ids_map()
cognito_users = cognito.get_users()

res = []
for cu in cognito_users:
    cu_email = cu["email"]
    if cu["custom:employeeId"] != sheets_email_to_id_map[cu_email]:
        res.append(cu)

print(res)
