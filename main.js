const { app, BrowserWindow, ipcMain, Tray } = require('electron');
const path = require('path');
const { default: axios } = require('axios');

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

    prompt = `<s>[INST]You are a helpful assistant. Provide a concise answer as the Assistant.[/INST] Okay!</s>[INST]${prompt}[/INST]`;

    const response = await axios.post(
      'http://0.0.0.0:11434/api/generate',
      {
        model,
        prompt,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        responseType: 'stream',
      },
    );

    let index = 0;

    response.data.on('data', (chunk) => {
      try {
        const data = JSON.parse(chunk.toString());
        data.index = index++;
        console.log(data);
        event.reply('message-response', data);
      } catch (error) {
        console.error('Incomplete or malformed chunk', error);
      }
    });

    response.data.on('end', () => {
      console.log('Stream ended');
    });

    response.data.on('error', () => {
      console.log('Stream error');
    });
  } catch (error) {
    console.error('Error:', error);
  }
});
