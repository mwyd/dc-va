FROM alpine:3.18.4

RUN apk update

RUN apk add \
    git \
    nodejs \
    npm \
    ffmpeg \
    python3 \
    py3-pip

RUN pip install gTTS

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .