
const express = require('express');
const router = express.Router();
const Guide = require('../models/Guide')

// 获取猫迹活动的数据
router.get('/ymzn/guide', async (req, res) => {
    try {

        let { page = 1, pageSize = 3, store = -1 } = req.query
        let data = await Guide.find({ to_examine: 'pass' }).populate('user_id').sort({ updated_at: store }).skip((page - 1) * pageSize).limit(pageSize);

        res.status(201).json({
            code: 201,
            message: "获取数据成功",
            result: {
                message: "获取数据成功",
                data: data
            },
        });


    } catch (err) {
        res.status(400).json({
            code: 400,
            message: "发布失败",
            result: {
                message: "发布失败",
                data: null
            },
        });
    }




})



// 基于id获取帖子数据
router.get('/ymzn/guidedetail', async (req, res) => {
    try {
        let { _id } = req.query
        let data = await Guide.findById({ _id: _id }).populate('user_id')
        data.clickCount++

        let dataCopy = await data.save()

        return res.status(201).json({
            code: 201,
            message: "获取数据成功",
            result: {
                message: "获取数据成功",
                data: dataCopy
            },
        });



    } catch (err) {
        res.status(400).json({
            code: 400,
            message: "获取数据失败",
            result: {
                message: "获取数据失败",
                data: null
            },
        });
    }



})




module.exports = router;

