# Discord Virtual Assistant
This project is the result of playing around with [discord.js](https://discord.js.org) and [OpenAI](https://openai.com/).

## Requirements
- Node.js >= 18.17.1
- [FFmpeg](https://www.ffmpeg.org/) >= 6.0
- [gTTS](https://pypi.org/project/gTTS/) >= 2.4.0

## Setup - docker
- create `.env.local` file based on `.env`
- run `docker compose up -d`
- run `docker exec -it va sh` to access container shell
- inside container run `npm install`
- inside container run `npm run start`

## Setup - local
- install `FFmpeg` and `gTTS`
- create `.env.local` file based on `.env`
- run `npm install`
- run `npm run start`