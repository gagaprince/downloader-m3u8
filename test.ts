import {downloadM3u8FileToMp4} from './index';
async function main(){
    try{
        await downloadM3u8FileToMp4({
            m3u8Url:'http://sezhanfabu.com:8080/ppvod/KHqgqgAa.m3u8',
            filePath:'./',
            title:'2021.1.30，【壹屌寻花】门票138，鸭哥上场约操极品外围女神，苗条美乳亲和善聊天'
        });
    }catch(e){
        console.log(e);
    }
}

main();