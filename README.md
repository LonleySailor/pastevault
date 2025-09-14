# PasteVault 🗄️

A lightweight, self-hosted pastebin clone written in Go with a React frontend.  
Built to be simple, secure, and easy to deploy — supports expiring pastes, optional password protection, and a REST API.

---

## 👋 About Me

I’m a student who enjoys programming, self-hosting, and building tools I can actually run myself.  
PasteVault started as a learning project in Go, but I wanted it to be something I (and others) could realistically use in a homelab or VPS setup.  

I used AI assistance along the way — I think AI is a big part of the future of development — but the architecture, design, and deployment setup are mine as well as parts of the code.

---

## ✨ Features

- Create and share text pastes
- Optional expiry times
- Optional password protection
- Simple REST API + React frontend
- Lightweight SQLite backend
- Easy self-hosting (Docker or K8s ready)

---

## 🚀 Getting Started

### Run locally

Requirements:  

- Go 1.21+  
- SQLite3  

```bash
git clone https://github.com/LonleySailor/pastevault.git
make start
```

Or use the docker-compose.yml in the REPO.
