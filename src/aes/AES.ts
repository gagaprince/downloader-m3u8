const cryptos = require('crypto');
const fs = require('fs');

export class AES {
    private key: any;
    private iv: any;
    constructor(key: string, iv: string) {
        this.key = Buffer.from(key, 'hex');
        this.iv = Buffer.from(iv, 'hex');
    }
    aesEncryptNew(buff: any) {
        let cipher = cryptos.createCipheriv('aes-128-cbc', this.key, this.iv);
        return cipher.update(buff, '', 'hex') + cipher.final('hex');
    }
    aesDecryptNew(buff: any) {
        let decipher = cryptos.createDecipheriv(
            'aes-128-cbc',
            this.key,
            this.iv
        );
        return decipher.update(buff, '', 'hex') + decipher.final('hex');
    }
}
