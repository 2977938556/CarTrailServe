
// 验证tokne是否合法与过期
const { CheckToken } = require('./token')
const User = require('../models/User.js')



// 白名单
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


    CheckToken(token).then(async (result) => {
        req.user = result.decoded; // 将解码后的用户信息存储到请求对象中方便日后获取用户数据
        // 这里还需要验证用户是否被封禁
        let user = await User.findOne({ user_id: req.user.username })
        // if (user === null) {
        //     return res.status(401).json({
        //         code: 401,
        //         message: "不存在当前账户",
        //         result: {
        //             message: "不存在当前账户",
        //             data: user
        //         },
        //     })
        // }



        next();
    }).catch(e => {
        return res.status(401).json({ message: '登录已过期，请重新登录', result: { message: '登录已过期，请重新登录' } });
    })
}

