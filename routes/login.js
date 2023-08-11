const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid')
let User = require('../models/User.js')
const { decryptPssword } = require('../utils/encryption.js')
const { AddToken, CheckToken } = require('../utils/token.js')


router.post('/user/login', (req, res) => {
    let { username, password } = req.body
    // 这里就需要查询用用户名称和手机号是否有这个账户
    // 如果没有查到那么就提示登录
    // 如果查询到了那么就将当前的密码进行比对
    // 明天早上完成加油啦 FeiMao@110
    try {
        // 查询用户
        User.findOne({
            // 通过用户名称和手机号进行查询
            $or: [
                { username: username },
                { mobile: username },
            ]
        }, (err, users) => {
            if (!users) {
                res.status(400).json({
                    code: 400,
                    message: "没有该用户请注册",
                    result: {
                        message: "没有该用户请注册",
                    },
                })
            } else {

                if (users.role === 'ban') {
                    res.status(401).json({
                        code: 401,
                        message: "当前账户被封禁了",
                        result: {
                            message: "当前账户被封禁了",
                            user: null,
                        },
                    })
                }


                if (users.role === 'delete') {
                    res.status(401).json({
                        code: 401,
                        message: "当前账户不存在",
                        result: {
                            message: "当前账户不存在",
                            user: null,
                        },
                    })
                }


                // 对比提交的密码和数据中的密码
                decryptPssword(password, users.password).then(async (value) => {
                    res.status(201).json({
                        code: 201,
                        message: "登录成功",
                        result: {
                            message: "登录成功",
                            user: users,
                            token: await AddToken(users.user_id)
                        },
                    })
                }).catch(err => {
                    res.status(400).json({
                        code: 400,
                        message: "账户或密码错误",
                        result: {
                            message: "账户或密码错误",
                        },
                    })
                })

            }

        });


    } catch (err) {
        // 所有服务器错误或者数据库错误就会进入到这里
        res.status(500).json({
            code: 500,
            message: "服务器错误1",
            result: {
                message: "服务器错误",
            },
        })
    }







});


module.exports = router