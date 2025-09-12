# PasteVault 🗄️

A lightweight, self-hosted pastebin clone written in Go.  
Supports expiring pastes, optional password protection, and a simple REST API.

---

## Features

- Create and share pastes
- Set optional expiry time
- Optional password protection
- Simple API + planned web interface
- Self-host with SQLite (Docker/K8s planned)

---

## Getting Started

### Requirements

- Go 1.21+
- SQLite3

### Run locally

```bash
git clone https://github.com/LonleySailor/pastevault.git
cd pastevault/backend

go mod tidy
go run main.go
#optional make usage
make build
make run
make build
make test
make dev
make health #Test health endpoint (server must be running)
