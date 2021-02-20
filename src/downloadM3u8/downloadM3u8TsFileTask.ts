import { DownLoad } from 'downloader-util';
import { Task } from '../task/taskUtil';

export default class DownloadM3u8TsFileTask extends Task {
    retry = 100;
    downloadTask: DownLoad | undefined;
    constructor(private fileUrl: string, private filePath: string) {
        super();
    }
    async task() {
        await this.doTask();
    }

    public getFileUrl() {
        return this.fileUrl;
    }
    public getFilepath() {
        return this.filePath;
    }

    async doTask() {
        return new Promise((res, rej) => {
            this.downloadTask = new DownLoad({
                url: this.fileUrl,
                filePath: this.filePath,
                timeout: 10000,
                onFailed: (error) => {
                    if (this.retry > 0 && error != '用户手动停止，停止下载') {
                        this.retry--;
                        res(this.doTask());
                    } else {
                        rej(error);
                    }
                },
                onSuccess: () => {
                    res('');
                },
            });
            this.downloadTask.start();
        });
    }

    stop() {
        if (this.downloadTask) {
            this.downloadTask.stop();
        }
    }
}
