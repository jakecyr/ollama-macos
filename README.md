# Ollama Mac App

A toolbar app to access a local model server on macOS served with [Ollama](https://ollama.ai/).

## Setup

1. Install [Ollama](https://ollama.ai/) on your computer
2. Clone the repo
3. Run `npm install` in the root to setup the electron app
4. Run `npm install` in the "client" folder to install the client dependencies
5. Download a model with the `ollama` CLI and run `ollama serve` to start serving the model
6. Run `npm start` in the root to start the electron app
7. Run `npm start` in the "client" folder to start the client app

An icon should appear in your Mac toolbar at the top right of your screen. Click on the icon to open the chat window.
