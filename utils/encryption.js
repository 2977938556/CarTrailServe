const bcrypt = require('bcrypt');// 加密密码

// 加密函数
let saltRounds = 10;// 这个是控制加密的级别
function PasswordEncryption(password) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                // 处理加密后的密码
                if (err) {
                    reject(false)
                } else {
                    resolve(hash)
                }
            });
        });
    })
}


// 解密模块
// password:原密码
// hashePasswod:加密的密码
function decryptPssword(password, hashedPassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hashedPassword, (err, result) => {
            if (err || result == false) {
                reject(false)
            } else {
                resolve(true)
            }
        });
    })
}


module.exports = {
    PasswordEncryption,
    decryptPssword

}
