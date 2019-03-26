#!/bin/sh
ISERROR=0

rm -rf node_modules && \
npm install && \
npx grunt setup && \
echo "OK!"
