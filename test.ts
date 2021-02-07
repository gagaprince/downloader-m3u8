import { downloadM3u8FileToMp4 } from './index';

async function downloadFile({url,name}:{url:string,name:string}){
    try {
        await downloadM3u8FileToMp4({
            m3u8Url:url,
            filePath:`../tmp/${name}/`,
            title:name
        });
    } catch (e) {
        console.log('下载失败！');
        console.log(e);
    }
}

async function main() {
    for(let i=1;i<=22;i++){
        let index=`${i}`;
        if(i<10){
            index = `0${i}`
        }
        await downloadFile({
            url:`https://cdn3.pztv.ca/upload/20171126/gl/01/${index}/1.m3u8`,
            name:`格林第一季${index}`
        });
    }
    


    // await downloadFile({
    //     url:'https://cdn3.pztv.ca/upload/20171126/gl/01/02/1.m3u8',
    //     name:'格林第一季02'
    // });
    
    // await downloadFile({
    //     url:'https://cdn77-vid.xvideos-cdn.com/u7LEg1SXMp6ekcSUDyk5YA==,1612642688/videos/hls/75/6a/6b/756a6b0f688f2ccfa95968793cec051a/hls-720p-ee8c8.m3u8',
    //     name:'Kayla Obey f. by Instructor'
    // });
    // await downloadFile({
    //     url:'http://sezhanfabu.com:8080/ppvod/lcCRKCEc.m3u8',
    //     name:'2021.1.30，【壹屌寻花】门票138，鸭哥上场约操极品外围女神，苗条美乳亲和善聊天'
    // });
    // await downloadFile({
    //     url:'http://sezhanfabu.com:8080/ppvod/xxaORYza.m3u8',
    //     name:'剧情演绎老总办公室强行把性感黑丝漂亮文秘给上了说只要同意她晋升经理就同意与他啪啪啪对白淫荡刺激'
    // });
    
    
}

main();