#!/usr/bin/env bash

while read p; do
  key=$(echo $p | cut -f1 -d =)
  value=$(echo $p | cut -f2 -d =)
  now secret add "${key//_/-}"  "$value"
done <.env

echo 'DONE!!!'