#!/bin/bash

# Returns the latest commit hash from local main and remote main
LOCAL_HASH=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse origin/main)

echo "{\"local\": \"$LOCAL_HASH\", \"remote\": \"$REMOTE_HASH\"}"
