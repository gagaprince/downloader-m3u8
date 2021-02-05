import { downloadM3u8FileToMp4 } from './index';
async function main() {
    try {
        await downloadM3u8FileToMp4({
            m3u8Url: 'http://devimages.apple.com/iphone/samples/bipbop/bipbopall.m3u8',
            filePath: './',
            title: '测试'
        });
    } catch (e) {
        console.log(e);
    }
}

main();