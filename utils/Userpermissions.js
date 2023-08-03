// const User = require('../models/User.js')


// // 这里我们需要就就是判断用户是否被封禁了还是账户已经不允许
// // 白名单
// let whiteList = ['/user/storysubmit', '/replay']


// exports.Userpermissions = async (req, res, next) => {
//     let index = whiteList.some(item => {
//         if (req.url.indexOf("submit") != -1) {
//             return true
//         }
//     })

//     if (!index) {
//         return next()
//     }


//     // 获取用户信息
//     let UserDat = await User.findOne({ user_id: req.user.username })


//     // 将用户的id保存到req中以便
//     req.user.user_id = UserDat._id;

//     if (UserDat.role !== "ban" && UserDat.role !== "delete") {
//         return next()
//     }

//     if (UserDat.role === "ban") {
//         return res.status(404).json({
//             code: 404,
//             message: "当前账户已经被封禁了",
//             result: {
//                 message: "当前账户已经被封禁了",
//                 data: UserDat
//             },
//         })

//     } else if (UserDat.role === "delete") {
//         return res.status(404).json({
//             code: 404,
//             message: "无当前账户",
//             result: {
//                 message: "无当前账户",
//                 data: UserDat
//             },
//         })
//     } else {
//         next()
//     }




// }



const User = require('../models/User.js')

// 白名单
let whiteList = ['/storysubmit', '/replay']

exports.Userpermissions = async (req, res, next) => {
    // 获取用户信息




    let index = whiteList.some(item => req.url.includes(item))

    // if (req.url.includes('/socket.io') && index == false) {
    //     console.log("是没有token01");
    //     return next()
    // }

    if (!index) {
        return next()
    }

    let user = await User.findOne({ user_id: req.user.username })


    // 将用户的id保存到 req 中以便其他操作使用
    req.user.user_id = user._id;

    if (!user || user.role === "delete") {
        return res.status(401).json({
            code: 401,
            message: "无当前账户",
            result: {
                message: "无当前账户",
                data: user
            },
        })
    }

    if (user.role === "ban") {
        return res.status(404).json({
            code: 404,
            message: "当前账户已经被封禁了",
            result: {
                message: "当前账户已经被封禁了",
                data: user
            },
        })
    }


    if (!['user', 'admin', 'ban', 'delete', 'institution', 'business'].includes(user.role)) {
        return res.status(401).json({
            code: 401,
            message: "账户状态出现问题，请联系管理员",
            result: {
                message: "账户状态出现问题，请联系管理员",
                data: null
            },
        })
    }




    next()
}
