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
            GetHomeRecommend({ ...req.body }).then(value => {
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


module.exports = router;

