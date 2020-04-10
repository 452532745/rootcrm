"use strict"
const crypto = require("crypto");

module.exports = {
  aesEncrypt: (data, key) => { // aes加密
    const cipher = crypto.createCipher('aes-128-ecb', key);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  },
  aesDecrypt: (encrypted, key) => { // aes解密
    const decipher = crypto.createDecipher('aes-128-ecb', key);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  },
  formatDate: (timestamp) => { // 日期格式化
    timestamp = typeof timestamp === 'number' ? timestamp : Number(timestamp)
    const date = new Date(timestamp)
    const Y = date.getFullYear() + '-'
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
    const D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' '
    const h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()) + ':'
    const m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':'
    const s = date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds()
    return Y + M + D + h + m + s
  }
}

