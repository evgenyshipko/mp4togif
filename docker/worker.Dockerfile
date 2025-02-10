FROM node:18

RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app

COPY .. .

RUN npm ci

CMD ["npm", "run", "start:worker"]
