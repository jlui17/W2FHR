import csv
import os
import cognito

attributes_to_get = ["email", "custom:employeeId"]

users = cognito.get_users()

no_id = []
for u in users:
  if not ("custom:employeeId" in u):
    no_id.append(u["email"])
if no_id:
  print("Emails with no IDs: " + str(no_id))

if os.path.exists("users.csv"):
  os.remove("users.csv")
file = open("users.csv", "x")
writer = csv.writer(file)

writer.writerow(attributes_to_get)

for u in users:
  writer.writerow((u["email"], u["custom:employeeId"]))

file.close()
