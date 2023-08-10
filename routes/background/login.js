const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid')
let User = require('../../models/User.js')
const { decryptPssword } = require('../../utils/encryption.js')
const { AddToken, CheckToken } = require('../../utils/token.js')


router.post('/bg/login', async (req, res) => {

    try {
        let { username, password } = req.body

        if (username == "" || password == "") {
            throw new Error("账户或者密码不能为空")
        }

        // 基于用户名称和手机号进行查询
        let UserDat = await User.findOne({
            $or: [
                { username: username },
                { mobile: username },
            ]
        })




        // 这里是没有查询不到用户
        if (UserDat == null) {
            throw new Error("没有该账户")
        }

        // // 验证密码
        let pasverfiy = await decryptPssword(password, UserDat.password)


        if (pasverfiy === false) {
            throw new Error("账户或者密码错误")
        }


        if (UserDat.role != "admin") {
            throw new Error("你没有权限登录")
        }

        // 登录成功
        res.status(200).json({
            code: 200,
            message: "登录成功",
            result: {
                message: "登录成功",
                data: UserDat,
                token: await AddToken(UserDat.user_id)
            },
        })

    } catch (err) {
        return res.status(400).json({
            code: 400,
            message: err.message || "账户获或者密码错误",
            result: {
                message: err.message || "账户获或者密码错误",
                data: null
            },
        })
    }

})

module.exports = router