import { download, HttpHeaders } from 'downloader-util';
export interface DownloadM3u8FileOption {
    url: string;
    headers?: HttpHeaders;
    file: string;
}
export const downloadM3u8File = async (
    opts: DownloadM3u8FileOption,
    retry: number = 10
): Promise<string> => {
    const { url, file, headers } = opts;
    return new Promise((res, rej) => {
        download({
            url,
            filePath: file,
            timeout: 10000,
            headers,
            onFailed: (error) => {
                console.log(error);
                console.log(retry);
                if (retry > 0) {
                    const ret = downloadM3u8File(opts, retry - 1);
                    ret.then(res).catch(rej);
                } else {
                    rej('下载失败');
                }
            },
            onSuccess: () => {
                res(file);
            },
        });
    });
};
