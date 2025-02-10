#!/bin/bash

URL="http://localhost:3000/upload"   # Адрес вашего сервера
FILE="./test-video1.mp4"             # Путь к видеофайлу, который будет загружаться
NUM_REQUESTS=1000                     # Количество запросов
CONCURRENCY=10                       # Количество одновременных запросов

function send_request {
    curl -X POST "$URL" -F "file=@$FILE" > /dev/null 2>&1
}

echo "Запуск нагрузочного теста: $NUM_REQUESTS запросов с параллельностью $CONCURRENCY..."

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

echo "Нагрузочный тест завершён."