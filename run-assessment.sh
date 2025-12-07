#!/bin/bash
export MONGODB_URI=$(grep MONGODB_URI .env.local | cut -d "=" -f2-)
node create-assessment-direct.mjs
