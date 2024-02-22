import { downloadM3u8File } from './downloadM3u8File';
import { parseM3u8File, M3u8FileOption } from './m3u8FileParser';
import { getFileContent, saveJson } from '../fileUtil/index';
import { TaskPool } from '../task/taskUtil';
import { AES } from '../aes/AES';
import DownloadM3u8TsFileTask from './downloadM3u8TsFileTask';
import { HttpHeaders } from 'downloader-util';
const md5 = require('md5');
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { parse } = require('url');
export interface DownloadM3u8Option {
    m3u8Url: string; //m3u8文件地址
    filePath: string; //最终保存文件目录
    title: string; //保存文件名 最终路径 `${filePath}${title}.mp4`
    headers?: HttpHeaders; //请求下载路径时的请求头
    ffmpegPath?: string;
    threadCount?: number; //线程数
    onProgress?: (percent: number) => void;
    onFinish?: () => void;
    onFail?: (e: any) => void;
}

export interface DownloadConfig {
    m3u8Url?: string;
    filePath?: string;
    title?: string;
    hasDownloadFiles?: string[];
    connectTsFile?: string;
}

export const getDownloadConfig = ({
    filePath,
    title,
}: DownloadM3u8Option): DownloadConfig => {
    const configFile = path.resolve(filePath, title, 'download.config');
    const content = getFileContent(configFile);
    if (content) {
        return JSON.parse(content);
    }
    return {
        filePath,
    };
};

export const saveDownloadConfig = (
    { filePath, title }: DownloadM3u8Option,
    config: DownloadConfig
) => {
    const configFile = path.resolve(filePath, title, `download.config`);
    saveJson(configFile, config);
};

export const deleteDownloadConfig = ({
    filePath,
    title,
}: DownloadM3u8Option) => {
    const configFile = path.resolve(filePath, title, 'download.config');
    fs.removeSync(configFile);
};

export const downloadM3u8FileToMp4 = async (
    opts: DownloadM3u8Option
): Promise<any> => {
    const { m3u8Url, filePath, title, headers } = opts;

    // clearFilePath(filePath);
    let downloadConfig = getDownloadConfig(opts);
    if (downloadConfig.m3u8Url !== m3u8Url) {
        downloadConfig.m3u8Url = m3u8Url;
        downloadConfig.title = opts.title;
        saveDownloadConfig(opts, downloadConfig);
    }
    // 下载 m3u8 文件
    const m3u8TempFile = path.resolve(filePath, title, 'tmp', 'des.m3u8');
    const m3u8file = await downloadM3u8File({
        url: m3u8Url,
        file: m3u8TempFile,
    });

    // 解析 m3u8 文件
    let m3u8Option = parseM3u8File(getFileContent(m3u8file));
    // console.log(JSON.stringify(m3u8Option));
    if (m3u8Option.type == 0) {
        // 需要再次下载真正的m3u8;
        if (m3u8Option.realM3u8Url) {
            //先删除原来的 m3u8TempFile 
            clearFilePath(m3u8TempFile)
            opts.m3u8Url = parseUrl(m3u8Url, m3u8Option.realM3u8Url);
            return downloadM3u8FileToMp4(opts);
        }
        throw 'm3u8文件有问题，请查看';
    }
    // 下载 解析 key
    m3u8Option = await downloadM3u8KeyFileAndParseKey(opts, m3u8Option);
    if (!downloadConfig.connectTsFile) {
        // 下载 ts 片段
        await downloadM3u8TsFile(opts, m3u8Option);
        // console.log(JSON.stringify(m3u8Option));
        // 合并ts片段
        const depathTs = await connectTsFile(opts, m3u8Option);

        downloadConfig = getDownloadConfig(opts);
        downloadConfig.connectTsFile = depathTs;
        saveDownloadConfig(opts, downloadConfig);

        deleteTmpFile(opts);
    }
    // 转换成mp4
    tranformMp4(opts);
    deleteTmpPath(opts);
};

export const tranformMp4 = (opts: DownloadM3u8Option) => {
    const { title, filePath, ffmpegPath = 'ffmpeg' } = opts;
    const depathMp4 = path.resolve(filePath, `${title}.ts`);

    try {
        execSync(
            `${ffmpegPath} -i "${depathMp4}" -acodec copy -vcodec copy -f mp4 "${depathMp4.replace(
                '.ts',
                '.mp4'
            )}"`
        );
        fs.removeSync(depathMp4);
    } catch (e) {
        console.log(e);
    }
};

const clearFilePath = (filePath: string) => {
    fs.removeSync(filePath);
};

export const deleteTmpFile = (opts: DownloadM3u8Option) => {
    const { filePath, title } = opts;
    const file = path.resolve(filePath, title, 'tmp');
    fs.removeSync(file);
};
export const deleteTmpPath = (opts: DownloadM3u8Option) => {
    const { filePath, title } = opts;
    const file = path.resolve(filePath, title);
    fs.removeSync(file);
};

export const connectTsFile = async (
    opts: DownloadM3u8Option,
    m3u8Option: M3u8FileOption
) => {
    const { title, filePath } = opts;
    const { key, iv, tsFiles = [] } = m3u8Option;
    const depathMp4 = path.resolve(filePath, `${title}.ts`);
    fs.ensureFileSync(depathMp4);
    if (key && iv) {
        const aes = new AES(key, iv);
        for (let i = 0; i < tsFiles.length; i++) {
            try {
                const spath = tsFiles[i];
                fs.ix;
                let buff = fs.readFileSync(spath);
                let deHex = aes.aesDecryptNew(buff);
                fs.writeFileSync(depathMp4, new Buffer(deHex, 'hex'), {
                    flag: 'a',
                });
            } catch (e) {
                continue;
            }
        }
        return depathMp4;
    } else if (key) {
        //没有iv的情况
        for (let i = 0; i < tsFiles.length; i++) {
            const index = i;
            let buffer = Buffer.alloc(16);
            buffer.writeUInt32BE(index, 12); //write the high order bits (shifted over)
            let iv = buffer.toString('hex');
            console.log(iv);
            const aes = new AES(key, iv);
            try {
                const spath = tsFiles[i];
                let buff = fs.readFileSync(spath);
                let deHex = aes.aesDecryptNew(buff);
                fs.writeFileSync(depathMp4, new Buffer(deHex, 'hex'), {
                    flag: 'a',
                });
            } catch (e) {
                continue;
            }
        }
        return depathMp4;
    } else {
        for (let i = 0; i < tsFiles.length; i++) {
            try {
                const spath = tsFiles[i];
                let buff = fs.readFileSync(spath);
                fs.writeFileSync(depathMp4, buff, {
                    flag: 'a',
                });
            } catch (e) {
                continue;
            }
        }
        return depathMp4;
    }
};

const downloadM3u8TsFile = async (
    opts: DownloadM3u8Option,
    m3u8Option: M3u8FileOption
) => {
    const {
        m3u8Url,
        filePath,
        title,
        headers,
        threadCount = 20,
        onProgress,
    } = opts;
    const { tsUrls } = m3u8Option;
    const downloadConfig = getDownloadConfig(opts);
    const { hasDownloadFiles = [] } = downloadConfig;
    const pool = new TaskPool(threadCount, hasDownloadFiles.length);
    const tsFiles: string[] = [];
    const fileSet = new Set<string>();
    hasDownloadFiles.forEach((file) => {
        fileSet.add(file);
    });
    tsUrls &&
        tsUrls.forEach((tsUrl, index) => {
            tsUrl = parseUrl(m3u8Url, tsUrl);
            const url = new URL(tsUrl);
            const fileName = md5(url.pathname);
            const file = path.resolve(filePath, title, 'tmp', fileName);
            tsFiles.push(file);
            if (!fileSet.has(file)) {
                pool.addTask(
                    new DownloadM3u8TsFileTask(tsUrl, file, headers || {})
                );
            }
        });

    m3u8Option.tsFiles = tsFiles;
    if (pool.isEmpty()) {
        return '';
    }
    pool.onProgress((progress: number, task: DownloadM3u8TsFileTask) => {
        // console.log(`当前进度:${progress * 100}%`);
        const filePath = task.getFilepath();
        hasDownloadFiles.push(filePath);
        downloadConfig.hasDownloadFiles = hasDownloadFiles;
        saveDownloadConfig(opts, downloadConfig);
        if (onProgress) {
            onProgress(progress);
        }
    });
    return new Promise((res, rej) => {
        pool.addFinishListener(res);
    });
};

export const downloadM3u8KeyFileAndParseKey = async (
    { m3u8Url, filePath, title, headers }: DownloadM3u8Option,
    m3u8Option: M3u8FileOption
): Promise<M3u8FileOption> => {
    const { keyUrl } = m3u8Option;
    if (keyUrl) {
        const keyUrlAll = parseUrl(m3u8Url, keyUrl);
        const m3u8KeyTempFile = path.resolve(filePath, title, 'tmp', 'tmp.key');
        const keyFile = await downloadM3u8File({
            url: keyUrlAll,
            headers,
            file: m3u8KeyTempFile,
        });
        const key = fs.readFileSync(keyFile, 'hex');
        m3u8Option.key = key;
    }
    return m3u8Option;
};

//相对路径换取正式网络地址
export const parseUrl = (sourceUrl: string, relativeUrl: string): string => {
    const up = parse(sourceUrl);
    let urlBase = '';
    if (relativeUrl.startsWith('/')) {
        const up = parse(sourceUrl);
        urlBase = sourceUrl.replace(up.path, '');
    } else if (relativeUrl.startsWith('http')) {
        urlBase = '';
    } else {
        urlBase = sourceUrl.substring(0, sourceUrl.lastIndexOf('/') + 1);
    }
    relativeUrl = `${urlBase}${relativeUrl}`;
    return relativeUrl;
};
