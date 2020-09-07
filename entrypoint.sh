#!/bin/bash
cd /app

yarn install

yarn dev

while true
do
    sleep 3600
done