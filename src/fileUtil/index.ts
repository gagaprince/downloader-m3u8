const fs = require('fs-extra');

export const getFileContent = (filePath:string):string=>{
    let fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent;
}