# arr-mcp-server

MCP (Model Context Protocol) server for managing a self-hosted media stack from any MCP-compatible client (Claude Desktop, Hermes, etc.).

## Features

- Search movies and TV shows across TMDB/TVDB via Radarr and Sonarr
- Add movies and series to your library with auto-download
- Track active downloads (qBittorrent + Radarr/Sonarr queue)
- Query your Plex library
- Get personalized recommendations based on your watch history

## Supported services

- Radarr
- Sonarr
- qBittorrent
- Plex Media Server
- Overseerr

## Requirements

- Node.js 22+
- Running instances of the services listed above
- API keys and credentials for each service

## Installation

```bash
git clone https://github.com/alexscdt/arr-mcp-server.git
cd arr-mcp-server
npm install
cp .env.example .env
# Edit .env with your credentials
npm run build
npm start
```

## Docker

```bash
docker build -t arr-mcp-server .
docker run --env-file .env arr-mcp-server
```

## License

MIT