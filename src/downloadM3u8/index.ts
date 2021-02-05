import { downloadM3u8File } from './downloadM3u8File';
import { parseM3u8File, M3u8FileOption } from './m3u8FileParser';
import { getFileContent } from '../fileUtil/index';
const fs = require('fs-extra');
const path = require('path');
const { parse } = require('url');
export interface DownloadM3u8Option {
    m3u8Url: string; //m3u8文件地址
    filePath: string; //最终保存文件目录
    title: string;   //保存文件名 最终路径 `${filePath}${title}.mp4`
};
export const downloadM3u8FileToMp4 = async (opts: DownloadM3u8Option): Promise<any> => {
    const { m3u8Url, filePath } = opts;

    // 下载 m3u8 文件
    const m3u8TempFile = path.resolve(filePath, 'tmp', 'des.m3u8');
    const m3u8file = await downloadM3u8File({
        url: m3u8Url,
        file: m3u8TempFile
    });

    // 解析 m3u8 文件
    let m3u8Option = parseM3u8File(getFileContent(m3u8file));
    if (m3u8Option.type == 0) {
        // 需要再次下载真正的m3u8;
        if (m3u8Option.realM3u8Url) {
            opts.m3u8Url = parseUrl(m3u8Url, m3u8Option.realM3u8Url);
            return downloadM3u8FileToMp4(opts);
        }
        throw "m3u8文件有问题，请查看";
    }
    // 下载 解析 key
    m3u8Option = await downloadM3u8KeyFileAndParseKey(opts, m3u8Option);
    // 下载 ts 片段

    console.log(JSON.stringify(m3u8Option));
    // 合并ts片段
    // 转换成mp4
}

const downloadM3u8TsFile = async ({ m3u8Url, filePath }: DownloadM3u8Option, m3u8Option: M3u8FileOption) => { }

const downloadM3u8KeyFileAndParseKey = async ({ m3u8Url, filePath }: DownloadM3u8Option, m3u8Option: M3u8FileOption): Promise<M3u8FileOption> => {
    const { keyUrl } = m3u8Option;
    if (keyUrl) {
        const keyUrlAll = parseUrl(m3u8Url, keyUrl);
        const m3u8KeyTempFile = path.resolve(filePath, 'tmp', 'tmp.key');
        const keyFile = await downloadM3u8File({
            url: keyUrlAll,
            file: m3u8KeyTempFile
        });
        const key = fs.readFileSync(keyFile, 'hex');
        m3u8Option.key = key;
    }
    return m3u8Option;
}

//相对路径换取正式网络地址
const parseUrl = (sourceUrl: string, relativeUrl: string): string => {
    const up = parse(sourceUrl);
    let urlBase = '';
    if (relativeUrl.startsWith('/')) {
        const up = parse(sourceUrl);
        urlBase = sourceUrl.replace(up.path, '');
    } else {
        urlBase = sourceUrl.substring(0, sourceUrl.lastIndexOf('/') + 1);
    }
    relativeUrl = `${urlBase}${relativeUrl}`;
    return relativeUrl;
}