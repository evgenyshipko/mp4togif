#!/bin/sh

sleep 10

mc alias set local http://localhost:9000 admin admin123

mc ls local/mp4-to-gif || mc mb local/mp4-to-gif

mc policy set public local/mp4-to-gif

echo "MinIO minio setted up successfully!"
