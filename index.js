const cluster = require('cluster');
const os = require('os');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');

const getDateString = require('./utils/getDateFormat');
const { download } = require('./utils/downloadManager');

const questions = [
  {
    type: 'list',
    name: 'inputType',
    message: 'Muốn tải gì ?',
    choices: [
      { name: 'Chỉ 1 video', value: 'single' },
      { name: 'Nguyên list', value: 'playlist' },
    ],
  },
  {
    type: 'input',
    name: 'url',
    message: "Bỏ Link vào đây !: ",
  },
  {
    type: 'list',
    name: 'outputType',
    message: 'Muốn tải nhạc hay cả hai?',
    choices: [
      { name: 'Chỉ nhạc', value: 'audio' },
      { name: 'Nhạc và líp', value: 'video' },
    ],
  },
  {
    type: 'input',
    name: 'outputDir',
    message: 'lưu vào đâu ?',
    default: './downloads/'
  },
];

const cpuCount = os.cpus().length;

(async () => {
  const { inputType, url, outputType, outputDir } = await inquirer.prompt(questions);
  let dirs = path.join(__dirname, `/downloads/`);
  if (outputDir != './downloads/') {
    dirs = outputDir.replace(/[\\\\]/g, '/');
    let last = dirs.substring(dirs.length-1,dirs.length);
    dirs += (last != "/" ? "/" :""); 
  }
  const downloadsFolder = `${dirs}${getDateString()}`;
  fs.mkdirSync(downloadsFolder);
  console.log("Dô !")
  if (inputType === 'playlist') {
    cluster.settings = {
      exec: './utils/multiThreadDownload.js',
    };

    for (let i = 1; i <= cpuCount; i++) {
      const childProcess = cluster.fork({
        processId: i,
        inputType,
        url,
        outputType,
        cpuCount,
        downloadsFolder,
      });

      childProcess.disconnect();
      
    }
  } else {
    await download(inputType, url, outputType, cpuCount, downloadsFolder);
  }
  renametoMp3(downloadsFolder);
})();

const renametoMp3 = (path) => {
  const filesNames = fs.readdirSync(path)
  for(let i=0; i<filesNames.length; i++){
    let name = filesNames[i].replace(".webm",".mp3").replace(".m4a",".mp3");
    console.log(name);
    fs.renameSync(
        __dirname + path + filesNames[i],
        __dirname + path + name )
}
}