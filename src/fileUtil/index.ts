const fs = require('fs-extra');

export const getFileContent = (filePath: string): string => {
    let fileContent;
    try {
        fileContent = fs.readFileSync(filePath, 'utf8');
    } catch (e) {
        return '';
    }
    return fileContent;
};

export const saveJson = (filePath: string, json: object) => {
    fs.ensureFileSync(filePath);
    fs.writeJsonSync(filePath, json);
};
