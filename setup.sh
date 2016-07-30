#!/bin/sh
ISERROR=0

rm -rf node_modules bower-task bower_components && \
npm install && \
grunt setup && \
echo "OK!"
