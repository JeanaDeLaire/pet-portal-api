#!/bin/bash

API="http://localhost:4741"
URL_PATH="/pets"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "pet": {
    "name": "'"${NAME}"'",
    "nickname": "'"${NICKNAME}"'",
    "age": "'"${AGE}"'"
    }
  }'

echo
