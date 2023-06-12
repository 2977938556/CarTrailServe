const express = require('express');
const router = express.Router();
// 导入Cat帖子模块
const Cat = require('../../../models/Cat.js')
const { v1, v4 } = require('uuid');// 生成随机id
const { delay } = require('../../../utils/UniversalFn.js');// 通用函数





// page pagesize type =["whole","examine","pass","nopass"]


// 这个是提供帖子数据的
router.post('/bg/catdata', async (req, res) => {
    // 这三个值分别是 当前第几页 每一页的数据 返回的数据类型
    let { page = 1, pageSize = 10, type = "whole", searchVal = "" } = req.body
    // 查询条件
    let query = {}



    const regExp = new RegExp(searchVal, 'i'); // 不区分大小写匹配
    // 这里判断是全部的数据的话就没有查询条件了
    if (type == "whole") {
        if (searchVal != "") {
            query.title = regExp
        }
    } else {
        if (searchVal != "") {
            query.title = regExp
        }
        // 这里就是返回数据回去
        query.to_examine = type
    }


    console.log(query);



    // 总条数
    var total = await Cat.collection.countDocuments(query);

    // 有多少页数据
    var pageCount = Math.ceil(total / pageSize);

    // 查询数据并查询出发布者的数据并通过分页的方式返回数据
    var data = await Cat.find(query).populate('user_id').sort().skip((page - 1) * pageSize).limit(pageSize)


    // await delay(2000)

    // 返回数据回去
    return res.status(200).json({
        code: 200,
        message: "数据返回成功",
        result: {
            message: "数据返回成功",
            data: data,
            total,
            pageCount,
        }
    })

})





// 修改帖子数据的
router.post('/bg/catpass', async (req, res) => {
    let { _id, type } = req.body


    // 这里是审核通过的情况，还需要发送一个信息给用户说已经审核完成 未完成也是一样的
    let data = await Cat.findById(_id)
    if (data) {
        // 这里是修改状态
        data.to_examine = type == true ? "pass" : "nopass"
        data.isApproved = true;
        // 重新存储数据到数据库中
        await data.save()


        // 这里需要广播一个消息给用户的通知列表中


        // 返回数据
        return res.status(200).json({
            code: 200,
            message: "数据返回成功",
            result: {
                message: "数据返回成功",
                data: data,
            }
        })





    }






})

module.exports = router