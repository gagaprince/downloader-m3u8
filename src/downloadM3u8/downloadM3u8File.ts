import { download } from 'downloader-util';
export interface DownloadM3u8FileOption{
    url:string;
    file:string;
}
export const downloadM3u8File = async (opts:DownloadM3u8FileOption):Promise<string>=>{
    const {url,file} = opts;
    return new Promise((res,rej)=>{
        download({url,filePath:file,onFailed:rej,onSuccess:()=>{
            res(file);
        }});
    });
}