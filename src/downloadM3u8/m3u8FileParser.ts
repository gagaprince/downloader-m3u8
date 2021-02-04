export interface M3u8FileOption{
    type:number;
    realM3u8Url?:string|undefined;
}

export const parseM3u8File = (content:string):M3u8FileOption=>{
    console.log(content);
    const lines = content.split('\n');
    const line = lines.find((line:string) => {
        if (line.indexOf('#EXT-X-STREAM-INF') != -1) return true;
    });
    if(line){
        let realM3u8Url = lines.find((line:string) => {
            if (line.indexOf('m3u8') != -1) return true;
        });
        console.log(realM3u8Url);
        return {type:0,realM3u8Url:realM3u8Url};
    }
    return {type:1};
}