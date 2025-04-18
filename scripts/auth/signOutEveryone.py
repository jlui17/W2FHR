import cognito

users = cognito.get_users()

for user in users:
    email = user["email"]
    cognito.client.admin_user_global_sign_out(UserPoolId=cognito.USER_POOL_ID, Username=email)
