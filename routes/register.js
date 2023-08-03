const express = require('express');
const router = express.Router();
// 导入User数据库
const User = require('../models/User')
const { v1, v4 } = require('uuid');// 生成随机id
const { PasswordEncryption } = require('../utils/encryption.js')
const Collect = require('../models/Collect.js')




// req.query获取的是get请求的书 【query】
// req.body 获取的是post请求的数据 【params 通常获取动态数据】
router.post('/user/register', async (req, res) => {
    let { username, password, mobile } = req.body


    try {
        // 查询手机号是否已经注册，如果没有注册则创建用户
        let user = await User.findOne({ mobile: mobile });
        // 有用户数据
        if (user) {
            res.status(400).json({
                code: 400,
                message: "该手机号已经注册，请更换手机号",
                result: {
                    message: "该手机号已经注册，请更换手机号",
                },
            })
        } else {
            // 没有查询到用户数据
            // 手机号未注册，查询名称是否被使用
            let usernameb = await User.findOne({ username: new RegExp(username, 'i') })
            // 有相同的名称
            if (usernameb) {
                res.status(400).json({
                    code: 400,
                    message: "该名称已经被使用，请更换名称",
                    result: {
                        message: "该名称已经被使用，请更换名称",
                    },
                })
            } else {
                // 注册
                // 手机号和名称未被注册，创建用户
                let user_id = v1()
                await User.create({
                    username: username,
                    password: await PasswordEncryption(password),
                    mobile: mobile,
                    user_id: user_id,
                });



                res.status(201).json({
                    code: 201,
                    message: "注册成功",
                    result: {
                        message: "注册成功",
                        username: username
                    },
                });


            }

        }
    } catch (err) {
        // 所有服务器错误或者数据库错误就会进入到这里
        res.status(500).json({
            code: 500,
            message: "服务器错误",
            result: {
                message: "服务器错误",
            },
        })
    }







});




module.exports = router;