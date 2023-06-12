const express = require('express');
const router = express.Router();
// 导入Cat帖子模块
const Cat = require('../../../models/Cat.js')
const { v1, v4 } = require('uuid');// 生成随机id




// page pagesize type =["whole","Audit","Audited","Fail"]


router.post('/bg/user', (req, res) => {
    res.send("返回用户数据成功")
})





module.exports = router