const express = require('express');
const path = require('path')
const router = express.Router();
const { v4: uuidv4 } = require('uuid')
const fs = require('fs');
const Cat = require('../models/Cat.js')
const User = require('../models/User.js')
const { delay } = require('../utils/UniversalFn.js');// 通用函数
const { GetDaat, GetQuery } = require('../utils/sh.js')// 获取数据模块和设置查询参数模块
const { Activity, Participant } = require('../models/Activit.js')// 分别是一个活动一个是用户报名的模块
const mongoose = require('mongoose');
const { ApplyFor } = require('../models/Adopt.js')
const { Follow } = require('../models/FollowUser.js')

const carouselData = [
    {
        id: 1,
        title: '轮播图1',
        imgUrl: 'https://n.sinaimg.cn/edu/transform/20161129/vFH5-fxycika9082742.jpg'
    },
    {
        id: 2,
        title: '轮播图2',
        imgUrl: 'https://mobile-img-baofun.zhhainiao.com/pcwallpaper_ugc_mobile/static/6e5ac7fde3e7e67b5eb8b1aa470124cc.jpg?x-oss-process=image%2Fresize%2Cm_lfit%2Cw_640%2Ch_1138'
    },
    {
        id: 3,
        title: '轮播图2',
        imgUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSn_9ltm95qVWV0e1Qa-IVBFb7WdR2xcmIgQ4fLrAfjYfWxZ6sdN4zFTrionvvp8NRRRzg&usqp=CAU'
    }
];

async function GetHomeRecommend({ city, page, cityAddrs, pageSize, CatRecommendBar = "B", userData }) {

    page = page || 1
    pageSize = pageSize || 3
    // 先判断是否是有地区的
    return new Promise(async (reolve, reject) => {
        let query = {}
        if (cityAddrs?.changeResult?.provinceCode == 1 || cityAddrs == null || JSON.stringify(cityAddrs) == "{}") {
            query = { to_examine: 'pass' }
        }

        if (cityAddrs != null && JSON.stringify(cityAddrs) != "{}" && cityAddrs?.changeResult?.provinceCode != 1) {
            // 这里将地区的数据设置未正则表达式，并且还设置了需要审核通过的才能被加载出来
            query = { "addrs.fullLocation": { $regex: ".*" + cityAddrs?.changeResult?.provinceName + ".*" }, to_examine: 'pass' };// 查询条件
        }

        // 设置是最新还是推荐
        let stores = CatRecommendBar == "B" ? 1 : -1

        // 查询总记录数，并计算总页数
        var total = await Cat.collection.countDocuments(query);
        var pageCount = Math.ceil(total / pageSize);


        if (CatRecommendBar == "B") {
            try {
                // 查询当前页的数据，并进行分页
                var data = await Cat.collection.find(query).sort({ updated_at: stores }).skip((page - 1) * pageSize).limit(pageSize).toArray();
                return reolve({
                    result: data,
                    total,
                    pageCount,
                    message: "数据获取成功",
                    valve: true
                })
            } catch (err) {
                reject({
                    result: [],
                    total,
                    pageCount,
                    message: "数据获取失败",
                    valve: false
                })
            }
        }

        if (CatRecommendBar == "C") {
            try {
                // 查询当前页的数据，并进行分页
                let data = await Cat.collection.find(query).sort({ updated_at: stores }).skip((page - 1) * pageSize).limit(pageSize).toArray();
                return reolve({
                    result: data,
                    message: "数据获取成功",
                    valve: true
                })
            } catch (err) {
                reject({
                    result: [],
                    message: "数据获取失败",
                    valve: false
                })

            }
        }

        if (CatRecommendBar == "A") {
            // 这里是需要迹

            Follow.findOne({ user_id: userData._id })
                .populate('follow.follow_id') // 使用populate方法关联到Cat模型
                .exec((err, follow) => {
                    if (err) {
                        console.error('查询关注用户时发生错误:', err);
                        return;
                    }

                    if (!follow) {
                        console.log('未找到关注用户的信息');
                        return;
                    }

                    // 获取关注用户的ID数组
                    const followUserIds = follow.follow.map(f => f.follow_id._id);

                    // 使用关注用户ID数组查询对应的帖子
                    Cat.find({ user_id: { $in: followUserIds }, to_examine: 'pass' }).sort({ updated_at: stores }).skip((page - 1) * pageSize).limit(pageSize)
                        .exec((err, posts) => {
                            if (err) {
                                reject({
                                    result: [],
                                    message: "数据获取失败",
                                    valve: false
                                })

                            }
                            return reolve({
                                result: posts,
                                message: "数据获取成功",
                                valve: true
                            })
                        });
                });







        }
    })
}

// 200 不创建资源但是返回资源
// 201  创建资源成功
// 400 服务器错误
// 401 需要验证身份

router.get('/home/banner', async (req, res) => {
    await delay(3000)

    // console.log(req.user);
    res.json({
        code: 200,
        message: "ok",
        result: carouselData
    });
});

// 获取推荐模块
router.post('/home/recommend', async (req, res) => {
    let { CatRecommendBar = "B" } = req.body;
    try {
        if (CatRecommendBar == "A") {
            let { result, total, pageCount } = await GetHomeRecommend({ ...req.body })
            await delay(1000)
            return res.status(200).json({
                code: 200,
                message: "数据返回成功",
                result: {
                    message: "数据返回成功",
                    data: result,
                    total,
                    pageCount,
                }
            })
        }

        if (CatRecommendBar == "B") {
            let { result, total, pageCount } = await GetHomeRecommend({ ...req.body })
            await delay(1000)
            return res.status(200).json({
                code: 200,
                message: "数据返回成功",
                result: {
                    message: "数据返回成功",
                    data: result,
                    total,
                    pageCount,
                }
            })
        }

        if (CatRecommendBar == "C") {
            let { result, total, pageCount } = await GetHomeRecommend({ ...req.body })
            await delay(1000)
            return res.status(200).json({
                code: 200,
                message: "数据返回成功",
                result: {
                    message: "数据返回成功",
                    data: result,
                    total,
                    pageCount,
                }
            })
        }



        // 异常捕获
    } catch (err) {
        return res.status(400).json({
            code: 400,
            message: "获取数据失败",
            result: {
                message: "获取数据失败",
                data: [],
            }
        })
    }




})

// 获取领养排行版的数据
router.post('/home/lyphlist', async (req, res) => {
    try {
        let { _id } = req.body


        let userApply = await ApplyFor.find({ user_id: _id }).populate('user_id') || []

        let dataMx = await ApplyFor.aggregate([
            {
                $group: {
                    _id: "$user_id",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    count: -1
                }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: "users", // 用户表的名称
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    user: 1,
                    count: 1
                }
            }
        ])


        if (!userApply || !dataMx) {
            throw new Error("获取排行失败")
        }


        return res.status(200).json({
            code: 200,
            message: "获取排行榜成功",
            result: {
                message: "获取排行榜成功",
                userApply,
                dataMx
            }
        })


    } catch (error) {
        console.log(error);
        return res.status(400).json({
            code: 400,
            message: error.message || "设置失败",
            result: {
                message: error.message || "设置失败",
                data: null
            },
        });
    }



})

module.exports = router;

