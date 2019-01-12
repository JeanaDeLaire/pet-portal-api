API="http://localhost:4741"
URL_PATH="/cares"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "care": {
      "pet": "'"${PET}"'",
      "type": "'"${TYPE}"'",
      "details": "'"${DETAILS}"'"
    }
  }'

echo
