#!/bin/bash

API="http://localhost:4741"
URL_PATH="/pictures"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Authorization: Bearer ${TOKEN}" \
  --form image="${PATH}" \
  --form description="${DESCRIPTION}" \
  --form url="${URL}" \
  --form date="${DATE}" \

echo
