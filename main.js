const { app, BrowserWindow, ipcMain  , dialog } = require("electron");
const path = require("path");
const ytdl = require('ytdl-core');
const youtubedl = require('youtube-dl-exec');
const { count, error } = require("console");
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const { exec } = require('child_process');

function isValidYoutubeLink(link) {
    // Regular expression to match YouTube video URLs
    const youtubeRegex = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/
    return youtubeRegex.test(link) && ytdl.validateURL(link);
}

let win = null;
function createWindow() {
    win = new BrowserWindow({
        width: 500,
        height: 200,
        frame: false,
        transparent: true,
        resizable:false,
        webPreferences: {
            webviewTag: true,
            preload: path.join(__dirname, 'preload.js')
        },
    });

    win.loadFile(path.join(__dirname, "layout.html"));
    win.webContents.openDevTools();
}

  
app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

ipcMain.on('closeWindow', (event, arg) => {
    console.log('colse')
    app.quit();
});
  
  
ipcMain.on('checkLink', async(event, url) => {
    if(isValidYoutubeLink(url)){
        try {
            const count = await getPlaylistElementsCount(url);
            win.webContents.send('readyDownload',{count,error:false,url});
        } catch (error) {
            sendError(error);
            win.webContents.send('readyDownload',{error:true,message:'network error'});
        }
        
    } else {
        win.webContents.send('readyDownload',{error:true});
    }

});

ipcMain.on('download', async(event, url) => {
    console.log(url)
    const result = await dialog.showOpenDialog({
        name:'EUDY',
        buttonLabel:'save',
        properties: ['openDirectory']
    });
    if(result.canceled){
        win.webContents.send('cancelDownload',true);
    }
    await processDownload(result,url);
});

const getPlaylistElementsCount = async (playlistUrl) => {
    try {
        const playlist = await youtubedl(playlistUrl, {
            flatPlaylist: true,
            getId: true,
        });
        // console.log(playlist);
        sendError(playlist);
        return playlist.replace(/\n/g, ',').split(',').length;
    } catch (error) {
        sendError(error);
        throw error;
    }
    
};

const processDownload = async (path,link) => {
    console.log(path,link);

    let settings = {
        ...(link.output === 'mp4'
          ? { recodeVideo: 'mp4', formatSort: 'res:1080' }
          : {}),
        ...(link.output === 'mp3'
          ? {
              audioFormat: 'mp3',
              extractAudio: true,
              audioFormat: 'mp3',
              audioQuality: 320,
              addMetadata: true
            }
          : {}),
      };

    if(link.count > 1) {
        settings = {
            ...settings,
            playlistStart: 1,
            playlistEnd: link.count,
          };
    }
    let a = await youtubedl(link.url, settings, { cwd: path.filePaths[0] });
    setTimeout(async x =>{
        await convertToMp3(path.filePaths[0])
        win.webContents.send('doneDownload',{error:true});
        openFolder(path.filePaths[0])
    },2000)
    
}

const convertToMp3 = async (path) => {
    try {
        const files = fs.readdirSync(path);
        let file;
        const musicExtensions = ['.webm', '.m4a', '.wav']; 
        for(let i = 0; i < files.length ;i++){
            file = files[i];
            if(musicExtensions.some(ext => file.endsWith(ext))) {
                await convertT(`${path}/${file}`, `${path}/${file.replace(/\.\w+$/, 'eudy.mp3')}`);
            }
            
        }
      } catch (err) {
        console.error('Error reading directory:', err);
        sendError(err);
      }
}

const openFolder = (path) => {
if (process.platform === 'win32') {
    exec(`start "" "${path}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error opening folder: ${error}`);
        return;
      }
      console.log('Folder opened successfully');
    });
  } else if (process.platform === 'darwin') {
    exec(`open "${path}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error opening folder: ${error}`);
        return;
      }
      console.log('Folder opened successfully');
    });
  } else {
    exec(`xdg-open "${path}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error opening folder: ${error}`);
        return;
      }
      console.log('Folder opened successfully');
    });
  }
}

async function convertT(inputFilePath, outputFilePath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputFilePath)
        .toFormat('mp3')
        .on('end', () => {
            console.log(`Converted ${outputFilePath} to MP3`);
            fs.unlinkSync(inputFilePath);
            console.log(`Deleted ${outputFilePath} after conversion.`);
            resolve('Conversion completed');
        })
        .on('error', err => {
            console.error(`Error converting ${outputFilePath}:`, err);
            sendError(err);
            reject(err);
        })
        .save(outputFilePath);
    });
  }

  const sendError = (error) =>{
    win.webContents.send('error',error);
  }