const express = require('express');
const router = express.Router();
const { v1, v4 } = require('uuid');// 生成随机id
let User = require('../../models/User.js')
const { PasswordEncryption } = require('../../utils/encryption.js')


router.post('/bg/register', async (req, res) => {
    try {
        let { username, password, code } = req.body

        if (username == "" || password == "" || code == "") {
            throw new Error("注册失败,请填写参数")
        }

        if (code != 74110) {
            throw new Error("注册失败，授权码错误")
        }

        // 查询是否有同名的
        let userData = await User.findOne({ username: username })

        if (userData != null) {
            throw new Error("当前存在该用户名称")
        }

        let userRegister = await User.create({
            username: username,
            password: await PasswordEncryption(password),
            role: 'admin',
            user_id: v1(),
            mobile: "",
        })

        res.status(201).json({
            code: 201,
            message: "注册成功",
            result: {
                message: "注册成功",
                username: userRegister
            },
        });

    } catch (err) {
        return res.status(400).json({
            code: 400,
            message: err.message || "注册失败",
            result: {
                message: err.message || "注册失败",
                data: null
            },
        })
    }









})


module.exports = router