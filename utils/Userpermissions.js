const { Activity, Participant } = require('../models/Activit.js')// 分别是一个活动一个是用户报名的模块
const User = require('../models/User.js')


// 这里我们需要就就是判断用户是否被封禁了还是账户已经不允许
// 白名单
let whiteList = ['/user/storysubmit']


exports.Userpermissions = async (req, res, next) => {
    let index = whiteList.some(item => {
        if (req.url.indexOf("submit") != -1) {
            return true
        }
    })

    if (!index) {
        return next()
    }

    // 获取用户信息
    let UserDat = await User.findOne({ user_id: req.user.username })

    console.log("进来了");

    // 将用户的id保存到req中以便
    req.user.user_id = UserDat._id;

    if (UserDat.role !== "ban" && UserDat.role !== "delete") {
        return next()
    }

    if (UserDat.role === "ban") {
        return res.status(404).json({
            code: 404,
            message: "当前账户已经被封禁了",
            result: {
                message: "当前账户已经被封禁了",
                data: UserDat
            },
        })

    } else if (UserDat.role === "delete") {
        return res.status(404).json({
            code: 404,
            message: "无当前账户",
            result: {
                message: "无当前账户",
                data: UserDat
            },
        })
    } else {
        next()
    }




}


