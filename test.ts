import { downloadM3u8FileToMp4, DownloadM3u8FileMp4 } from './index';
import { getFileContent } from './src/fileUtil';

async function downloadFile({ url, name }: { url: string; name: string }) {
    try {
        await downloadM3u8FileToMp4({
            m3u8Url: url,
            filePath: `../tmp/`,
            title: name,
            onProgress(progress) {
                console.log(`进度---${progress * 100}%`);
            },
        });
    } catch (e) {
        console.log('下载失败！');
        console.log(e);
    }
}

async function downloadFile1({ url, name }: { url: string; name: string }) {
    return new Promise((res, rej) => {
        const task = new DownloadM3u8FileMp4({
            m3u8Url: url,
            filePath: `../tmp/`,
            title: name,
        });
        task.onProgress((progress: number) => {
            console.log(`${name}进度---${progress * 100}%`);
        });
        task.onFinish(() => {
            console.log(`${name}已完成`);
            res('');
        });
        task.onFail((e) => {
            console.log(`${name}--${e}`);
            rej(e);
        });
        task.start();
        // setTimeout(() => {
        //     console.log('10s之后停止!')
        //     task.stop();
        // }, 10000)
    });
}

async function main() {

    await downloadFile1({
        url: 'http://devimages.apple.com/iphone/samples/bipbop/bipbopall.m3u8',
        // url: 'https://v.xboku.com/20200813/TZFNhKYK/index.m3u8',
        name: '苹果测试'
    });

    // const content = getFileContent(`../tmp/download.tmp`);
    // console.log(content);
    //   for (let i = 1; i <= 22; i++) {
    //     let index = `${i}`;
    //     if (i < 10) {
    //       index = `0${i}`;
    //     }
    //     await downloadFile({
    //       //   url: `https://cdn3.pztv.ca/upload/20171126/gl/02/${index}/1.m3u8`,
    //       url: `https://cdn3.pztv.ca/upload/20171126/gl/04/${index}/1.m3u8`,
    //       name: `格林第四季${index}`,
    //     });
    //   }
    // const urls = [
    //     'https://tv.wedubo.com/20200730/BS0yWqSZ/index.m3u8',
    //     'https://tv.wedubo.com/20200731/HiTPReRQ/index.m3u8',
    //     'https://tv.wedubo.com/20200806/IDj1TXwB/index.m3u8',
    //     'https://tv.wedubo.com/20200809/KwhuUuiD/index.m3u8',
    //     'https://v.xboku.com/20200813/TZFNhKYK/index.m3u8',
    //     'https://v.xboku.com/20200814/k4ER5Q41/index.m3u8',
    //     'https://v.xboku.com/20200820/BqY3ZleC/index.m3u8',
    //     'https://v.xboku.com/20200821/zsq6xCNJ/index.m3u8',
    //     'https://v.xboku.com/20200827/JeOKJ5WJ/index.m3u8',
    //     'https://v.xboku.com/20200828/rxWj1nQa/index.m3u8',
    //     'https://v.xboku.com/20200903/JyoZX0P7/index.m3u8',
    //     'https://v.xboku.com/20200910/brZS0g9O/index.m3u8',
    //     'https://v.xboku.com/20200911/K30txjD8/index.m3u8',
    //     'https://v.xboku.com/20200917/QU8jiqDJ/index.m3u8',
    //     'https://v.xboku.com/20200918/kBKBxVXR/index.m3u8',
    //     'https://v.xboku.com/20200924/TuRzkLOm/index.m3u8',
    // ];
    // for (let i = 0; i < urls.length; i++) {
    //     await downloadFile({
    //         url: urls[i],
    //         name: `恶之花${i + 1}`,
    //     });
    // }
}

main();
