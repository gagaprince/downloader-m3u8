import { download } from 'downloader-util';
import { Task } from '../task/taskUtil';

export default class DownloadM3u8TsFileTask extends Task {
    retry = 100;
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
            download({
                url: this.fileUrl,
                filePath: this.filePath,
                timeout: 10000,
                onFailed: (error) => {
                    console.log(error);
                    if (this.retry > 0) {
                        this.retry--;
                        res(this.doTask());
                    } else {
                        rej('下载重试100次依然失败');
                    }
                },
                onSuccess: () => {
                    res('');
                },
            });
        });
    }
}
