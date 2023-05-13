const express = require('express');
const path = require('path')
const router = express.Router();
const { v4: uuidv4 } = require('uuid')
const fs = require('fs');
const Cat = require('../models/Cat.js')





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


// 200 不创建资源但是返回资源
// 201  创建资源成功
// 400
// 401



router.get('/home/banner', (req, res) => {
    // console.log(req.user);
    res.json({
        code: 200,
        message: "ok",
        result: carouselData
    });
});





// 获取推荐模块
router.post('/home/recommend', async (req, res) => {
    let { page, pageSize, cityAddrs, CatRecommendBar, userData } = req.body;
    console.log(cityAddrs);

    // 设置的默认值
    let pages = page || 1;
    let pageSizes = pageSize || 6;

    var query = {};// 查询条件
    // 判断条件
    if (CatRecommendBar == "A") {
        // 没有地区进行查询
        if (cityAddrs == null) {
            var query = {};
            // 查询总记录数，并计算总页数
            var total = await Cat.collection.countDocuments(query);
            var pageCount = Math.ceil(total / pageSizes);

            // 查询当前页的数据，并进行分页
            var data = await Cat.collection.find(query).skip((pages - 1) * pageSize).limit(pageSize).toArray();
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

    } else if (CatRecommendBar == "B") {

        // 没有地区进行查询
        if (cityAddrs == null) {
            // 查询总记录数，并计算总页数
            var total = await Cat.collection.countDocuments(query);
            var pageCount = Math.ceil(total / pageSizes);

            // 查询当前页的数据，并进行分页
            var data = await Cat.collection.find(query).skip((pages - 1) * pageSize).limit(pageSize).toArray();
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
        } else {

            // 查询总记录数，并计算总页数
            query = { "addrs.fullLocation": { $regex: ".*" + cityAddrs.changeResult.provinceName + ".*" } };// 查询条件
            var total = await Cat.collection.countDocuments(query);
            var pageCount = Math.ceil(total / pageSizes);

            // 查询当前页的数据，并进行分页
            var data = await Cat.collection.find(query).skip((pages - 1) * pageSize).limit(pageSize).toArray();

            console.log(data);
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


    } else if (CatRecommendBar == "C") {

        // 有地区
        // 没有地区
        query = {};
        // 查询总记录数，并计算总页数

        var total = await Cat.collection.countDocuments(query);
        var pageCount = Math.ceil(total / pageSizes);

        // 查询当前页的数据，并进行分页
        var data = await Cat.collection.find(query).sort({ time: -1 }).skip((pages - 1) * pageSize).limit(pageSize).toArray();

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











    res.status(200).json({
        code: 200,
        message: "数据返回成功",
        result: {
            message: "数据返回成功",
        },
    })

})











module.exports = router;