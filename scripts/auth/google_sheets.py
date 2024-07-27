from google.oauth2 import service_account
from googleapiclient.discovery import build
import boto3
from botocore.exceptions import ClientError
import json
import os

STAFF_LIST_SHEET_ID = "1kwvcsbcyHA5x__RoXzo1a-4b1zURwwCUuahCgNUtAJ8"
STAFF_LIST_EMPLOYEE_ID_RANGE = "'Total Staff'!A2:A"
STAFF_LIST_EMAIL_RANGE = "'Total Staff'!G2:G"

GOOGLE_SHEETS_SECRET_FILE_NAME = "google-sheets-secret.txt"
client = None

if os.path.exists(GOOGLE_SHEETS_SECRET_FILE_NAME):
    f = open(GOOGLE_SHEETS_SECRET_FILE_NAME)
    secret_string = f.readline()
    cred = service_account.Credentials.from_service_account_info(json.loads(secret_string))
    client = build("sheets", "v4", credentials=cred).spreadsheets()
    f.close()
else: 
    boto3.setup_default_session(profile_name="w2f")

    secrets_client = boto3.client("secretsmanager")
    try:
        print("No Google Service account credentials found. Attempting to retrieve them...")
        secret = secrets_client.get_secret_value(SecretId="G_SERVICE_CONFIG")
        G_SERVICE_CONFIG = secret["SecretString"]

        f = open(GOOGLE_SHEETS_SECRET_FILE_NAME, "x")
        f.writelines([G_SERVICE_CONFIG])
        f.close()
        print("Successfully retrieved Google Service account credentials and saved them.")
        cred = service_account.Credentials.from_service_account_info(json.loads(G_SERVICE_CONFIG))
        client = build("sheets", "v4", credentials=cred).spreadsheets()
    except ClientError as e:
        raise e

def get_employee_ids():
    result = (
        client.values()
        .get(spreadsheetId=STAFF_LIST_SHEET_ID, range=STAFF_LIST_EMPLOYEE_ID_RANGE, majorDimension="COLUMNS")
        .execute()
    )

    return result.get("values", [None])[0]

def get_emails():
    result = (
        client.values()
        .get(spreadsheetId=STAFF_LIST_SHEET_ID, range=STAFF_LIST_EMAIL_RANGE, majorDimension="COLUMNS")
        .execute()
    )

    emails = result.get("values", [None])[0]
    return list(map(lambda e: e.lower(), emails))
        

def get_emails_to_ids_map():
    res = {}
    ids = get_employee_ids()
    emails = get_emails()

    if len(ids) != len(emails):
        print("[ERROR] Email and ID column not in sync in staff list")
        exit(0)

    for i in range(len(emails)):
        res[emails[i]] = ids[i]
    return res
