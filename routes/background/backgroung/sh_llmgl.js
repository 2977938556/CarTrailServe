const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
// 导入Cat帖子模块
const Cat = require('../../../models/Cat.js')
const { v1, v4 } = require('uuid');// 生成随机id
const { delay } = require('../../../utils/UniversalFn.js');// 通用函数
const Story = require('../../../models/Story.js');
const { Query } = require('mongoose');
const { GetIp } = require('../../../utils/https.js')
const path = require('path')
const fs = require('fs');
const { Activity } = require('../../../models/Activit.js')
const User = require('../../../models/User.js')



// 分别是获取数据列表和 基于提交数据返回需要进行查询的参数
const { GetDaat, GetQuery } = require('../../../utils/sh.js')



// // 获取各个审核模块的列表数据
// function GetDaat({ modules, query, pageSize, page, stores = { updated_at: 1 } }) {
//     return new Promise(async (resolve, reject) => {
//         // 总条数
//         let totals = await modules.collection.countDocuments(query);
//         // 有多少页数据
//         let pageCounts = Math.ceil(totals / pageSize);
//         // 查询数据并查询出发布者的数据并通过分页的方式返回数据
//         let datas = await modules.find(query).populate('user_id').sort(stores).skip((page - 1) * pageSize).limit(pageSize)

//         if (datas != null) {
//             resolve({
//                 totals,
//                 pageCounts,
//                 datas
//             })
//         } else {
//             reject(new Error("获取数据失败"))
//         }
//     })
// }


// 这个是审核模块封装的函数
async function PushData({ modules, _id, type }) {
    return new Promise(async (resolve, reject) => {
        // 这里是审核通过的情况，还需要发送一个信息给用户说已经审核完成 未完成也是一样的
        let data = await modules.findById(_id)
        if (data) {
            // 这里是修改状态
            if (type == true) {
                data.to_examine = "pass"
            } else if (type == false) {
                data.to_examine = "nopass"
            } else if (type == "end") {
                data.to_examine = "end"
            } else if (type = "cancellation") {
                data.to_examine = "cancellation"
            } else if (type = "delete") {
                data.to_examine = "delete"
            }

            if (data.isApproved) {
                data.isApproved = true
            }
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
    return new Promise(async (resolve, reject) => {
        let data = await modules.findById(id).populate('user_id')
        if (data) {
            resolve(data)
        } else {
            reject(new Error("获取数据失败"))
        }

    })
}


// 添加活动活动模块 待修改
async function PushImg(imgBase64, types, savea, saveb) {
    let savePath = path.join(__dirname, `${savea}`);// 当前储存的地址
    let imgType = types.substring(types.lastIndexOf("/") + 1);// 图片的后缀名
    const randomChars = `${Math.random().toString(36).substring(2, 10)}${new Date().getTime()}.${imgType}`// 生成一个图片名称
    let imgUrl = path.join(savePath, randomChars);// 这个是获取用户的后缀名名称

    const base64Data = imgBase64.replace(/^data:image\/\w+;base64,/, '');// 这个是只截取base64后面的内容部分
    const buffer = Buffer.from(base64Data, 'base64');// 这个转换成bufer流

    return new Promise((resolve, reject) => {
        fs.writeFile(imgUrl, buffer, async (err) => {
            if (err) {
                reject(err)
            } else {
                // 这里返回
                let imgUrl = `http://${await GetIp()}:3000${saveb}/${randomChars}`
                resolve({
                    imgUrl: imgUrl,//图片的服务器地址
                    savePath: savePath,// 图片的需要删除地址
                })
            }
        })
    })
}


// 这个是提供帖子数据的
router.post('/bg/shdata', async (req, res) => {
    // 这三个值分别是 当前第几页 每一页的数据 返回的数据类型
    // type的值有：whole/默认
    let { page = 1, pageSize = 10, type, searchVal = "", typeofs = "llm" } = req.body

    // 传递参数获取查询条件查询条件
    let query = GetQuery(type, searchVal)

    let data = null
    let total = 0
    let pageCount = 0

    // 这个是用于获取数据的模块
    let stores = { updated_at: -1 }

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
    } else if (typeofs == "mjhd") {
        let { totals, pageCounts, datas } = await GetDaat({ modules: Activity, query, pageSize, page, stores })
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

// 基于id查询出当前需要详细查看的数据
router.get('/bg/catiddata', async (req, res) => {
    try {
        // 获取当前的帖子的id
        let { id, typeofs } = req.query;

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
        } else if (typeofs == "mjhd") {
            data = await GetDataId({ modules: Activity, id })
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

// 修改帖子数据的(审核)
router.post('/bg/catpass', async (req, res) => {
    let { _id, type, typeofs } = req.body
    let data = null

    try {
        // 流浪猫审核
        if (typeofs == 'llm') {
            data = await PushData({ modules: Cat, _id, type })
            // 猫迹故事审核
        } else if (typeofs == "mjgs") {
            data = await PushData({ modules: Story, _id, type })
            // 猫迹活动审核
        } else if (typeofs == "mjhd") {
            data = await PushData({ modules: Activity, _id, type })
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

// 存储活动数据
router.post('/bg/activity', async (req, res) => {
    let { base64, imgType, title, adds, content, time, people } = req.body

    try {
        let users = await User.findOne({ user_id: req.user.username })


        let { imgUrl } = await PushImg(base64, imgType, '../../../public/uploads/activity', '/public/uploads/activity')

        let activity = new Activity({
            user_id: users._id,
            title,
            content,
            adds,
            people,
            time,
            imageUrl: [imgUrl],// 图片数据存储的是图片地址
        })

        let data = await activity.save()

        return res.status(201).json({
            code: 201,
            message: "数据返回成功",
            result: {
                message: "数据返回成功",
                data: data,
            }
        })

    } catch (err) {
        console.log(err);
        return res.status(404).json({
            code: 404,
            message: "发布失败",
            result: {
                message: "发布失败",
                data: null,
            }
        })
    }




})


// 审核活动模块





module.exports = router