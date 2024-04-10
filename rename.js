
const fs = require(`fs`)
const filesNames = fs.readdirSync(`./downloads/2024-4-9_14-52-36/`)

for(let i=0; i<filesNames.length; i++){
    // filesNames[i] = fs.renameSync(filesNames[i], newArr[i])
    
    let name = filesNames[i].replace(".webm",".mp3").replace(".m4a",".mp3");
    console.log(name);
    fs.renameSync(
        __dirname + '/downloads/2024-4-9_14-52-36/' + filesNames[i],
        __dirname + '/downloads/2024-4-9_14-52-36/' + name )
}
