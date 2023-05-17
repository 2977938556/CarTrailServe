const express = require('express');
const router = express.Router();
let User = require('../models/User.js')
let Cat = require('../models/Cat.js')
let Collect = require('../models/Collect.js')
const { decryptPssword } = require('../utils/encryption.js')
const { delay } = require('../utils/UniversalFn.js')// 通用函数
const mongoose = require('mongoose');
const { v1, v4 } = require('uuid')







// 获取帖子详情的数据
router.get('/detail/cate', async (req, res) => {
    try {
        // 这里我先是查找到用户的帖子在从帖子中获取user的数据
        let DetailData = await Cat.findOne({ cat_id: req.query.id }).populate('user_id')
        if (DetailData != null) {
            await delay(10)
            return res.status(200).json({
                code: 200,
                message: "查询成功",
                result: {
                    message: "查询成功",
                    data: DetailData
                }
            })
        } else {
            res.status(400).json({
                code: 400,
                message: "获取数据失败",
                result: {
                    message: "获取数据失败",
                    data: DetailDat
                },
            })
        }


    } catch (e) {
        res.status(400).json({
            code: 400,
            message: "获取数据失败",
            result: {
                message: "获取数据失败",
                data: null

            },
        })


    }

});


// 获取用户用户收藏的数据
router.get('/detail/collect', async (req, res) => {
    let collect_id = v1()
    // 这里我们先查询是否有这个集合如果没有那么就创建，如果有那么就返回数据回去，
    let collectionName = 'collectschems'
    let mark = await mongoose.connection.db.listCollections({ name: collectionName }).next()
    if (mark == null) {
        // 创建集合
        // 创建一个空的集合
        await Collect.create({
            collect_id: collect_id,
            user_id: req.query.user_id,
            bookmarks: [],
        })

    }

    // 这里是如果有集合那么就
    if (mark != null) {
        // 不等于的情况下
        let CollectData = await Collect.findOne({ user_id: req.query.user_id });

        // 这里是指如果没有查询到有收藏的数据那么就是需要被创建一个收藏集合
        if (CollectData == null) {
            console.log("进来这里了错误");
            // 创建新的空白无数据集合
            let newCollect = await Collect.create({
                collect_id: collect_id,
                user_id: req.query.user_id,
                bookmarks: [],
            })
            return res.status(200).json({
                code: 200,
                message: "查询成功",
                result: {
                    message: "查询成功",
                    data: newCollect
                }
            })
        }

        // 返回成功的数据
        return res.status(200).json({
            code: 200,
            message: "查询成功",
            result: {
                message: "查询成功",
                data: CollectData
            }
        })

    }
})


// 用户点击收藏与取消收藏
router.post('/detail/collect', async (req, res) => {

    // 第一个是作品的数据
    // 第二个是作品是否被收藏，
    // 第三个是作品的数据
    let { DetailData, cat_id, userData, collectFlage } = req.body



    try {

        // 思路大概是这样的
        // 当为false表示没有被收藏所以需要进行收藏
        // 当为true则反之，需要被删除里面的元素
        if (collectFlage == false) {
            let ceshi = await Collect.findOne({ user_id: userData.user_id })
            ceshi.bookmarks.push({
                created_at: Date.now(),
                user_id: DetailData.user_id.user_id,// 发布者的id
                cat_id: cat_id,// 发布者的帖子id
                title: DetailData.title// 发布者的帖子标题
            })

            // 持久化存储
            await ceshi.save()

            return res.status(200).json({
                code: 200,
                message: "收藏成功",
                result: {
                    message: "收藏成功",
                    data: ceshi
                }
            })
        }




        // 需要被删除
        if (collectFlage == true) {
            // 根据用户的id进行删除
            let ceshi = await Collect.findOne({ user_id: userData.user_id })
            let index = ceshi?.bookmarks.findIndex(item => item.cat_id == cat_id)
            ceshi.bookmarks.splice(index, 1)

            // 持久化存储
            await ceshi.save()
            return res.status(200).json({
                code: 200,
                message: "取消收藏成功",
                result: {
                    message: "取消收藏成功",
                    data: ceshi
                }
            })
        }
    } catch (err) {
        return res.status(400).json({
            code: 400,
            message: "获取数据失败",
            result: {
                message: "获取数据失败",
                data: []
            }
        })
    }









    // try {
    //     // 未收藏
    //     if (req.body.collectFlage == false) {
    //         let ceshi = await Collect.findOne({ user_id: collectData.user_id })
    //         ceshi.bookmarks.push({
    //             created_at: Date.now(),
    //             user_id: DetailData.user_id.user_id,
    //             cat_id: DetailData.cat_id,
    //             title: DetailData.title
    //         })

    //         // 持久化存储
    //         await ceshi.save()
    //         // 返回
    //         return res.status(200).json({
    //             code: 200,
    //             message: "收藏成功",
    //             result: {
    //                 message: "查询成功",
    //                 data: ceshi
    //             }
    //         })

    //     } else if (req.body.collectFlage == true) {
    //         console.log("取消收藏");
    //         // 收藏的话就需要取消
    //         let ceshi = await Collect.findOne({ user_id: collectData.user_id })


    //         let index = ceshi.bookmarks.findIndex(item => {
    //             // item.cat_id == DetailData.cat_id
    //             console.log(item.cat_id == DetailData.cat_id);
    //         })
    //         // console.log(index);
    //         // ceshi.bookmarks.splice(index, 1)




    //         // bug就是这里，回教室做了
    //         // 持久化存储
    //         // await ceshi.save()
    //         // 返回
    //         return res.status(200).json({
    //             code: 200,
    //             message: "收藏成功",
    //             result: {
    //                 message: "查询成功",
    //                 data: []
    //             }
    //         })




    //     }



    // } catch (err) {
    //     return res.status(400).json({
    //         code: 400,
    //         message: "失败",
    //         result: {
    //             message: "查询成功",
    //             data: []
    //         }
    //     })

    // }
})


module.exports = router