#!/bin/bash

URL="http://localhost:3000/upload"   # your server address
FILE="./static/test-video.mp4"             # path to video file to upload
NUM_REQUESTS=1000                     # number of requests
CONCURRENCY=10                       # number of synchronous requests

function send_request {
    curl -X POST "$URL" -F "file=@$FILE" > /dev/null 2>&1
}

echo "Load test startup: $NUM_REQUESTS requests with concurrency $CONCURRENCY..."

start_time=$(date +%s)

for i in $(seq 1 $NUM_REQUESTS); do
    send_request &
    if ((i % CONCURRENCY == 0)); then
        wait
    fi
done

wait

end_time=$(date +%s)

execution_time=$((end_time - start_time))

echo "Time taken for request: $execution_time seconds"

echo "Load test ended"