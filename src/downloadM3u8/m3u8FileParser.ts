export interface M3u8FileOption {
    type: number;
    realM3u8Url?: string | undefined;
    keyUrl?: string;
    key?: string;
    iv?: string;
    tsUrls?: string[];
    tsFiles?: string[];
}

export const parseM3u8File = (content: string): M3u8FileOption => {
    const lines = content.split('\n');
    const line = lines.find((line: string) => {
        if (line.indexOf('#EXT-X-STREAM-INF') != -1) return true;
    });
    if (line) {
        let realM3u8Url = lines.find((line: string) => {
            if (line.indexOf('m3u8') != -1) return true;
        });
        console.log(realM3u8Url);
        return { type: 0, realM3u8Url: realM3u8Url };
    }
    return { type: 1, keyUrl: parseKey(content), iv: parseIV(content), tsUrls: parseTsUrls(content) };
}

const parseKey = (content: string): string => {
    const lines = content.split('\n');
    const line = lines.find((line: string) => {
        if (line.indexOf('EXT-X-KEY') != -1) return true;
    });
    const keys = line?.split(',') || '';
    try {
        return keys[1].split('=')[1].replace('"', '').replace('"', '');
    } catch (e) {
        return '';
    }
}

const parseIV = (content: string): string => {
    const lines = content.split('\n');
    const line = lines.find((line) => {
        if (line.indexOf('EXT-X-KEY') != -1) return true;
    });
    const keys = line?.split(',') || '';
    try {
        return keys[2].split('=')[1].substring(2);
    } catch (e) {
        return '';
    }
}

const parseTsUrls = (content: string): string[] => {
    const lines = content.split('\n');
    const urls = lines.filter((line) => {
        return line != '' && line.indexOf('EXT') == -1;
    });
    return urls;
}