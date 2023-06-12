
// 验证tokne是否合法与过期
const { CheckToken } = require('./token')


let whiteList = ['/user/login', '/user/register', '/bg/login']
exports.authMiddleware = (req, res, next) => {
    // 从请求头中获取token

    // 验证是否在白名单中的数据是的话就进行下一步操作不进行验证
    if (whiteList.some(item => req.url.indexOf(item) != -1)) {
        return next()
    }
    // 截取出用户的token
    const token = req.headers.authorization?.split(' ')[1];

    // 判断是否有token 
    if (!token) {
        return res.status(401).json({ message: '登录已过期，请重新登录', result: { message: '登录已过期，请重新登录' } });
    }

    CheckToken(token).then(result => {
        req.user = result.decoded; // 将解码后的用户信息存储到请求对象中
        next();
    }).catch(e => {
        return res.status(401).json({ message: '登录已过期，请重新登录', result: { message: '登录已过期，请重新登录' } });
    })
}

