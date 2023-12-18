const { app, BrowserWindow, ipcMain, Tray } = require('electron');
const path = require('path');
const { Ollama } = require('langchain/llms/ollama');

let tray = null;
let window = null;

const createWindow = () => {
  window = new BrowserWindow({
    width: 500,
    height: 300,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'client', 'public', 'preload.js'),
    },
  });

  window.loadURL('http://localhost:3000');
  window.on('closed', () => (window = null));
  window.on('blur', () => {
    window.hide();
  });
  window.setWindowButtonVisibility(false);
};

app.on('ready', () => {
  tray = new Tray(path.join(__dirname, 'IconTemplate.png'));

  tray.on('click', () => {
    if (window && window.isVisible()) {
      window.hide();
      return;
    }

    if (window === null) {
      createWindow();
    } else {
      window.show();
    }

    const iconBounds = tray.getBounds();
    const windowBounds = window.getBounds();
    const x = Math.round(iconBounds.x + iconBounds.width / 2 - windowBounds.width / 2);
    const y = Math.round(iconBounds.y + iconBounds.height);

    window.setPosition(x, y, false);
  });
});

ipcMain.on('send-message', async (event, prompt) => {
  try {
    const model = 'mistral';
    const baseUrl = 'http://localhost:11434';

    prompt = `<s>[INST]You are a helpful assistant. Provide a concise single answer as the Assistant.[/INST] Okay!</s>[INST]User: ${prompt}\nAssistant: [/INST]`;

    const ollama = new Ollama({ baseUrl, model });
    const stream = await ollama.stream(prompt);

    for await (const chunk of stream) {
      event.reply('message-response', {
        content: chunk,
        done: false,
      });
    }

    event.reply('message-response', {
      content: '',
      done: true,
    });
  } catch (error) {
    console.error('Error streaming response:', error);
  }
});
