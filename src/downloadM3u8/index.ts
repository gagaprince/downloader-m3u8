import {downloadM3u8File} from './downloadM3u8File';
import {parseM3u8File,M3u8FileOption} from './m3u8FileParser';
import {getFileContent} from '../fileUtil/index';
const path = require('path');
const {parse} = require('url');
export interface DownloadM3u8Option{
    m3u8Url:string; //m3u8文件地址
    filePath:string; //最终保存文件目录
    title:string;   //保存文件名 最终路径 `${filePath}${title}.mp4`
};
export const downloadM3u8FileToMp4 = async (opts:DownloadM3u8Option):Promise<any>=>{
    const {m3u8Url,filePath} = opts;

    const m3u8TempFile = path.resolve(filePath,'tmp','des.m3u8');
    const m3u8file = await downloadM3u8File({
        url:m3u8Url,
        file:m3u8TempFile
    });

    const m3u8Option = parseM3u8File(getFileContent(m3u8file));
    if(m3u8Option.type==0){
        // 需要再次下载真正的m3u8;
        if(m3u8Option.realM3u8Url){
            opts.m3u8Url = parseRealM3u8Url(m3u8Url,m3u8Option.realM3u8Url);
            return downloadM3u8FileToMp4(opts);
        }
        throw "m3u8文件有问题，请查看";
    }
    console.log(JSON.stringify(m3u8Option));
}

const parseRealM3u8Url = (m3u8Url:string,realM3u8Url:string):string=>{
    const up = parse(m3u8Url);
    let urlBase = '';
    if(realM3u8Url.startsWith('/')){
        const up = parse(m3u8Url);
        urlBase = m3u8Url.replace(up.path,'');
    }else{
        urlBase = m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1);
    }
    realM3u8Url = `${urlBase}${realM3u8Url}`;
    return realM3u8Url;
}