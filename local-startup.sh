#!/bin/bash

docker stack rm mp4-to-gif

docker ps | grep "registry" || docker run -d -p 5000:5000 --name registry registry:2 || true

docker build -t localhost:5000/image_client -f docker/client.Dockerfile .
docker build -t localhost:5000/image_server -f docker/server.Dockerfile .
docker build -t localhost:5000/image_worker -f docker/worker.Dockerfile .

docker push localhost:5000/image_client
docker push localhost:5000/image_server
docker push localhost:5000/image_worker

docker stack deploy -c docker-compose.yml mp4-to-gif
