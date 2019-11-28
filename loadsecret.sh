#!/usr/bin/env bash

while read p; do
  key=$(echo $p | cut -f1 -d = | tr '[:upper:]' '[:lower:]')
  value=$(echo $p | cut -f2 -d =)
  now secret add "${key//_/-}"  "$value"
  [[ ! $? -eq 0 ]] && [[ "$1" = '--force' ]] \
    && echo "Override $key" \
    && now secret -y rm "${key//_/-}" \
    && now secret add "${key//_/-}"  "$value" \

done <.env

echo 'DONE!!!'