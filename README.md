# downloader-m3u8

# Install

    npm install downloader-m3u8

# Usage

    const {downloadM3u8FileToMp4} = require('downloader-m3u8');

    const url = 'https://s4-e1.dnvodcdn.me/s2/ppot/_definst_/mp4:s2/gvod/jq-sndn-480p-0381816F1.mp4/chunklist.m3u8?dnvodendtime=1612881511&dnvodhash=iVlwFy30xr0_yTO5dxcLMoGdvVJT4W1i_R18jz_jlXA=&dnvodCustomParameter=0_45.130.146.197&lb=23c4d04a6ad7641a4adb0ffcb7853561';
    const name = '少年的你';

    downloadM3u8FileToMp4({
        m3u8Url:url,    // m3u8url
        filePath:`../tmp/${name}/`,  //文件保存路径 会先清空目录，请选择干净的目录
        title:name, // 最终保存的文件名
        threadCount:10 // 开启几个线程并发下载
    });
