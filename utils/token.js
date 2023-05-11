const jwt = require('jsonwebtoken');
const secret = 'FeiMao@110Miaoya'; // 定义密钥


// 生成tokne
// username:用户传递的名称
// time：token过期的时间
// 当前时间
const now = Math.floor(Date.now() / 1000)
// 过期时间为一分钟后
const expires = now + 60

// 生成token
exports.AddToken = (username, time) => {
    return new Promise((reolve, reject) => {
        const token = jwt.sign({ username }, secret, { expiresIn: `1h` });
        if (token != "") {
            reolve(token)
        }
    })
}

// 验证token是否有效
exports.CheckToken = (token) => {
    return new Promise((resolve, reject) => {
        try {
            const decoded = jwt.verify(token, secret);
            resolve({ decoded: decoded, token: true })
        } catch (err) {
            reject({ token: false })
        }
    })
}

