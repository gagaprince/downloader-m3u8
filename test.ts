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
    });
}

async function main() {
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
    await downloadFile1({
        url: 'https://vs02.520call.me/files/mp4/k/kQ04i.m3u8?t=1613534095',
        name:
            'AQSH-051 為了不孕治療到診所的妻子被變態治療中出搞成淫亂女…。 紗紗原百合[有碼高清中文字幕]',
    });
    // await downloadFile({
    //     url: 'https://vs02.520call.me/files/mp4/l/lNBFK.m3u8?t=1613496687',
    //     name:
    //         'WAAA-004 亀頭2.5cmまで挿入OK！ギリギリ「不倫未満」と言い張る性欲ムラムラ浮気妻 つぼみ',
    // });
    // await downloadFile({
    //     url:
    //         'https://605ziyuan.com/ppvod/E8172CD85851856D6F2622B28B60DD1D.m3u8',
    //     name: '禁止的爱：表姐妹们',
    // });
    // await downloadFile({
    //     url:
    //         'https://video.huishenghuo888888.com/jingpin/20201226/99HY5CCG/index.m3u8',
    //     name: '两个女儿同居',
    // });
    // await downloadFile({
    //     url:
    //         'https://video.huishenghuo888888.com/jingpin/20210108/0lXABcus/index.m3u8',
    //     name: '兄弟的女人',
    // });
    // await downloadFile({
    //     url:
    //         'https://video.huishenghuo888888.com/jingpin/20201006/z3RoPMW5/index.m3u8',
    //     name: '城市艳情',
    // });
    // await downloadFile({
    //     url: 'https://www.fhbf9.com/20200706/sRBYLHtg/1000kb/hls/index.m3u8',
    //     name: '热线女孩',
    // });
}

main();
