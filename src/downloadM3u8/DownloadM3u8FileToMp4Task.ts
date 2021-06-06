import {
    DownloadM3u8Option,
    getDownloadConfig,
    saveDownloadConfig,
    parseUrl,
    downloadM3u8KeyFileAndParseKey,
    connectTsFile,
    tranformMp4,
    deleteTmpPath,
    deleteTmpFile,
} from './downloadM3u8FileToMp4';
import DownloadM3u8TsFileTask from './downloadM3u8TsFileTask';
import { TaskPool } from '../task/taskUtil';
import { downloadM3u8File } from './downloadM3u8File';
import { getFileContent, saveJson } from '../fileUtil/index';
import { parseM3u8File, M3u8FileOption } from './m3u8FileParser';
const path = require('path');
enum DownloadState {
    STOP = 0,
    START,
}
export class DownloadM3u8FileMp4 {
    downloadOption: DownloadM3u8Option;
    state: DownloadState;
    pool: TaskPool | undefined;
    doProgress: ((progress: number) => void) | undefined;
    doFinish: (() => void) | undefined;
    doFail: ((msg: any) => void) | undefined;
    constructor(opt: DownloadM3u8Option) {
        this.downloadOption = opt;
        const { onProgress, onFinish, onFail } = opt;
        onProgress && (this.doProgress = onProgress);
        onFinish && (this.doFinish = onFinish);
        onFail && (this.doFail = onFail);
        this.state = DownloadState.STOP;
    }
    async start() {
        this.state = DownloadState.START;
        try {
            const ret = await this.startDownload();
            if (ret !== 'finish') {
                console.log('任务取消，可以重新发起');
                this.doFail && this.doFail('用户手动停止');
            } else {
                console.log('任务完成');
                this.doFinish && this.doFinish();
            }
        } catch (e) {
            this.doFail && this.doFail(e);
        }
    }
    async startDownload(): Promise<any> {
        if (this.state !== DownloadState.START) return '';
        const { m3u8Url, filePath, title } = this.downloadOption;
        let downloadConfig = getDownloadConfig(this.downloadOption);
        if (downloadConfig.m3u8Url !== m3u8Url) {
            downloadConfig.m3u8Url = m3u8Url;
            downloadConfig.title = title;
            saveDownloadConfig(this.downloadOption, downloadConfig);
        }

        const m3u8TempFile = path.resolve(filePath, title, 'tmp', 'des.m3u8');
        const m3u8file = await downloadM3u8File({
            url: m3u8Url,
            file: m3u8TempFile,
            headers: this.downloadOption.headers || {},
        });
        if (this.state !== DownloadState.START) return '';

        let m3u8Option = parseM3u8File(getFileContent(m3u8file));
        // console.log(JSON.stringify(m3u8Option));
        if (m3u8Option.type == 0) {
            // 需要再次下载真正的m3u8;
            if (m3u8Option.realM3u8Url) {
                this.downloadOption.m3u8Url = parseUrl(
                    m3u8Url,
                    m3u8Option.realM3u8Url
                );
                return this.startDownload();
            }
            throw 'm3u8文件有问题，请查看';
        }

        m3u8Option = await downloadM3u8KeyFileAndParseKey(
            this.downloadOption,
            m3u8Option
        );
        if (this.state !== DownloadState.START) return;
        if (!downloadConfig.connectTsFile) {
            // 下载 ts 片段
            await this.downloadM3u8TsFile(m3u8Option);
            // console.log(JSON.stringify(m3u8Option));
            // 合并ts片段
            const depathTs = await connectTsFile(
                this.downloadOption,
                m3u8Option
            );

            downloadConfig = getDownloadConfig(this.downloadOption);
            downloadConfig.connectTsFile = depathTs;
            saveDownloadConfig(this.downloadOption, downloadConfig);

            deleteTmpFile(this.downloadOption);
        }
        // 转换成mp4
        tranformMp4(this.downloadOption);
        deleteTmpPath(this.downloadOption);
        return 'finish';
    }

    async downloadM3u8TsFile(m3u8Option: M3u8FileOption) {
        const {
            m3u8Url,
            filePath,
            title,
            headers,
            threadCount = 20,
        } = this.downloadOption;
        const { tsUrls } = m3u8Option;
        const downloadConfig = getDownloadConfig(this.downloadOption);
        const { hasDownloadFiles = [] } = downloadConfig;
        const pool = (this.pool = new TaskPool(
            threadCount,
            hasDownloadFiles.length
        ));
        const tsFiles: string[] = [];
        const fileSet = new Set<string>();
        hasDownloadFiles.forEach((file) => {
            fileSet.add(file);
        });
        tsUrls &&
            tsUrls.forEach((tsUrl, index) => {
                tsUrl = parseUrl(m3u8Url, tsUrl);
                const url = new URL(tsUrl);
                const fileName = url.pathname
                    .substring(url.pathname.lastIndexOf('/') + 1)
                    .split('?')[0];
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
            if (this.state == DownloadState.START) {
                // console.log(`当前进度:${progress * 100}%`);
                const filePath = task.getFilepath();
                hasDownloadFiles.push(filePath);
                downloadConfig.hasDownloadFiles = hasDownloadFiles;
                saveDownloadConfig(this.downloadOption, downloadConfig);
                this.doProgress && this.doProgress(progress);
            } else {
            }
        });
        return new Promise((res, rej) => {
            pool.addFinishListener(res);
            pool.addStopListener(rej);
        });
    }

    stop() {
        this.state = DownloadState.STOP;
        if (this.pool) {
            this.pool.stop();
        }
    }
    onProgress(doProgress: (progress: number) => void) {
        this.doProgress = doProgress;
    }
    onFinish(doFinish: () => void) {
        this.doFinish = doFinish;
    }
    onFail(doFail: (e: any) => void) {
        this.doFail = doFail;
    }
}
