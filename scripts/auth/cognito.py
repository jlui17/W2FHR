import boto3
from botocore.exceptions import ClientError

boto3.setup_default_session(profile_name="w2f")

client = boto3.client("cognito-idp")
USER_POOL_ID = "us-west-2_8cGhNwlEM"
client_id = "4kkjr0at3bjoeli3uuprqrthru"

def get_users():
    paginator = client.get_paginator("list_users")
    try:
        users = []
        it = paginator.paginate(UserPoolId=USER_POOL_ID)
        for p in it:
            for rawU in p["Users"]:
                u = {}
                for a in rawU["Attributes"]:
                    if a["Name"] == "email":
                        a["Value"] = a["Value"].lower() # some emails have letter case, we ignore case in cognito
                    u[a["Name"]] = a["Value"]
                users.append(u)

        return users
    except ClientError as err:
        print("Error: " + err)
        raise
