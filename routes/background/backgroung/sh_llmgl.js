const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
// 导入Cat帖子模块
const Cat = require('../../../models/Cat.js')
const { v1, v4 } = require('uuid');// 生成随机id
const { delay } = require('../../../utils/UniversalFn.js');// 通用函数
const Story = require('../../../models/Story.js');
const { Query } = require('mongoose');




// 获取各个审核模块的列表数据
function GetDaat({ modules, query, pageSize, page }) {
    console.log(query);

    return new Promise(async (resolve, reject) => {
        // 总条数
        let totals = await modules.collection.countDocuments(query);
        // 有多少页数据
        let pageCounts = Math.ceil(totals / pageSize);
        // 查询数据并查询出发布者的数据并通过分页的方式返回数据
        let datas = await modules.find(query).populate('user_id').sort().skip((page - 1) * pageSize).limit(pageSize)

        if (datas != null) {
            resolve({
                totals,
                pageCounts,
                datas
            })
        } else {
            reject(new Error("获取数据失败"))
        }
    })
}


// 审核各个模块是函数
async function PushData({ modules, _id, type }) {
    return new Promise(async (resolve, reject) => {
        // 这里是审核通过的情况，还需要发送一个信息给用户说已经审核完成 未完成也是一样的
        let data = await modules.findById(_id)
        if (data) {
            // 这里是修改状态
            data.to_examine = type == true ? "pass" : "nopass"
            data.isApproved = true;
            // 重新存储数据到数据库中
            let saveData = await data.save()
            return resolve(saveData)
            // 这里需要广播一个消息给用户的通知列表中
        } else {
            reject(new Error("修改错误"))
        }
    })
}



// 通过id和类型获取帖子的详情数据
async function GetDataId({ modules, id }) {
    console.log(id);
    return new Promise(async (resolve, reject) => {
        let data = await modules.findById(id).populate('user_id')
        if (data) {
            resolve(data)
        } else {
            reject(new Error("获取数据失败"))
        }

    })
}



// 这个是提供帖子数据的
router.post('/bg/shdata', async (req, res) => {
    // 这三个值分别是 当前第几页 每一页的数据 返回的数据类型
    let { page = 1, pageSize = 10, type, searchVal = "", typeofs = "llm" } = req.body

    // 查询条件
    let query = {}

    const regExp = new RegExp(searchVal, 'i'); // 不区分大小写匹配

    // 这里判断是全部的数据的话就没有查询条件了
    if (type == "whole") {
        query = {}
    } else {
        // 这里就是返回数据回去
        query.to_examine = type
    }

    // 这里是搜索的条件
    if (searchVal != "") {
        query.title = regExp
        query.content = regExp
        query.to_examine = regExp
    }



    let data = null
    let total = 0
    let pageCount = 0



    // 这里我们做一个判断
    if (typeofs === "llm") {
        let { totals, pageCounts, datas } = await GetDaat({ modules: Cat, query, pageSize, page })
        data = datas
        pageCounts = pageCounts
        total = totals


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
    } else if (typeofs === "mjgs") {
        let { totals, pageCounts, datas } = await GetDaat({ modules: Story, query, pageSize, page })
        data = datas
        pageCounts = pageCounts
        total = totals

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
    }







})


// 修改帖子数据的
router.post('/bg/catpass', async (req, res) => {
    let { _id, type, typeofs } = req.body
    let data = null

    try {
        if (typeofs == 'llm') {
            data = await PushData({ modules: Cat, _id, type })
        } else if (typeofs == "mjgs") {
            data = await PushData({ modules: Story, _id, type })
        }

        return res.status(200).json({
            code: 200,
            message: "修改成功",
            result: {
                message: "修改成功",
                data: data,
            }
        })


    } catch (err) {
        return res.status(404).json({
            code: 404,
            message: "修改失败哦",
            result: {
                message: "修改失败哦",
                data: null,
            }
        })
    }




})



// 这里是需要通过id查询出当前的帖子数据
router.get('/bg/catiddata', async (req, res) => {
    try {
        // 获取当前的帖子的id
        let { id, typeofs } = req.query;

        console.log(id, typeofs);

        let data = null

        if (typeofs == "llm") {
            data = await GetDataId({ modules: Cat, id })
            return res.status(200).json({
                code: 200,
                message: "数据返回成功",
                result: {
                    message: "数据返回成功",
                    data: data,
                }
            })
        } else if (typeofs == "mjgs") {
            data = await GetDataId({ modules: Story, id })
            return res.status(200).json({
                code: 200,
                message: "数据返回成功",
                result: {
                    message: "数据返回成功",
                    data: data,
                }
            })
        }




    } catch (err) {
        return res.status(200).json({
            code: 404,
            message: "数据返回成功",
            result: {
                message: "数据返回成功",
                data: null,
            }
        })
    }


})



module.exports = router