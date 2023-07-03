const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid')
let User = require('../../models/User.js')
const { decryptPssword } = require('../../utils/encryption.js')
const { AddToken, CheckToken } = require('../../utils/token.js')


router.post('/bg/login', async (req, res) => {
    let { username, password } = req.body
    console.log(username, password);
    // 这里就需要查询用用户名称和手机号是否有这个账户
    // 如果没有查到那么就提示登录
    // 如果查询到了那么就将当前的密码进行比对
    // 明天早上完成加油啦 FeiMao@110



    // 先去查询是否有该用户


    // 如果没有找到该用户那么返回没有该管理员请检查用户名和密码
    // 如果找到了，就返回密码错误
    // 如果找到了，但是他不是管理员那么就返回你无权访问


    try {
        // 这里是去查询当前用户
        let userObj = await User.findOne({
            $or: [
                { username: username },
                { mobile: username },
            ]
        })



        // 这里是没有找到的情况下
        if (!userObj) {
            return res.status(400).json({
                code: 400,
                message: "账户获或者密码错误",
                result: {
                    message: "账户获或者密码错误",
                    data: null
                },
            })
        }


        // 找到的情况下

        // 判断是否被封禁了
        if (userObj.role == "ban") {
            return res.status(400).json({
                code: 400,
                message: "当前账户已经被封禁了",
                result: {
                    message: "当前账户已经被封禁了",
                    data: null
                },
            })
        }

        // 判断是否是管理
        if (userObj.role == "delete") {
            return res.status(400).json({
                code: 400,
                message: "没有当前账户",
                result: {
                    message: "没有当前账户",
                    data: null
                },
            })
        }


        // 判断是否是管理
        if (userObj.role != "admin") {
            return res.status(400).json({
                code: 400,
                message: "当前账户无权访问",
                result: {
                    message: "当前账户无权访问",
                    data: null
                },
            })
        }


        // 这里是正确的情况下
        if (userObj.role == "admin") {
            decryptPssword(password, userObj.password).then(async (value) => {
                return res.status(201).json({
                    code: 201,
                    message: "登录成功",
                    result: {
                        message: "登录成功",
                        data: userObj,
                        token: await AddToken(userObj.user_id)
                    },
                })
            }).catch((err) => {
                return res.status(400).json({
                    code: 400,
                    message: "账户获或者密码错误",
                    result: {
                        message: "账户获或者密码错误",
                        data: null
                    },
                })
            })




        }








    } catch {
        res.status(500).json({
            code: 500,
            message: "服务器错误1",
            result: {
                message: "服务器错误",
                data: null
            },
        })
    }









    // try {
    //     // 查询用户
    //     User.findOne({
    //         // 通过用户名称和手机号进行查询
    //         $or: [
    //             { username: username },
    //             { mobile: username },
    //         ]
    //     }, (err, users) => {
    //         if (!users) {
    //             res.status(400).json({
    //                 code: 400,
    //                 message: "没有该用户请注册",
    //                 result: {
    //                     message: "没有该用户请注册",
    //                 },
    //             })
    //         } else {
    //             // 对比提交的密码和数据中的密码
    //             decryptPssword(password, users.password).then(async (value) => {



    //                 res.status(201).json({
    //                     code: 201,
    //                     message: "登录成功",
    //                     result: {
    //                         message: "登录成功",
    //                         user: users,
    //                         token: await AddToken(users.user_id)
    //                     },
    //                 })
    //             }).catch(err => {
    //                 res.status(400).json({
    //                     code: 400,
    //                     message: "账户或密码错误",
    //                     result: {
    //                         message: "账户或密码错误",
    //                     },
    //                 })
    //             })

    //         }

    //     });


    // } catch (err) {
    //     // 所有服务器错误或者数据库错误就会进入到这里
    //     res.status(500).json({
    //         code: 500,
    //         message: "服务器错误1",
    //         result: {
    //             message: "服务器错误",
    //         },
    //     })
    // }







});


module.exports = router