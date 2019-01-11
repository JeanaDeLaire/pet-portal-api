#!/bin/bash

API="http://localhost:4741"
URL_PATH="/cares"

curl "${API}${URL_PATH}" \
  --include \
  --request PATCH \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "care": {
      "diet": "'"${DIET}"'",
      "medicine": "'"${MEDICINE}"'",
      "vet": "'"${VET}"'",
      "lastAppt": "'"${LASTAPPT}"'",
      "nextAppt": "'"${NEXTAPPT}"'"
    }
  }'

echo
