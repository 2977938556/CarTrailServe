const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid')
let User = require('../../models/User.js')
let Cat = require('../../models/Cat.js')
const { decryptPssword } = require('../../utils/encryption.js')
const { AddToken, CheckToken } = require('../../utils/token.js')
const { ApplyFor } = require('../../models/Adopt.js')
const { SeatchHistory } = require('../../models/Search.js')





// 获取发布指数和用户增长指数
router.post('/echarts/llmfb', async (req, res) => {
    try {
        // 基于两个参数进行判断
        // llmfb:流浪猫发布 userzz:用户
        let { type = 'llmfb', time = 10 } = req.body

        let model = null


        if (type === 'llmfb') {
            model = Cat
        } else if (type === "userzz") {
            model = User
        }

        if (!model) {
            throw new Error("获取数据失败")
        }


        let numDays = time; // 自定义要获取的天数
        let today = new Date();// 获取当前的时间
        today.setHours(0, 0, 0, 0); // 设置时、分、秒、毫秒为0

        const timestamps = [];
        for (let i = 0; i < numDays; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            timestamps.push(date.getTime());
        }

        const dates = timestamps.map(timestamp => {
            const date = new Date(timestamp);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${month}.${day}`;
        });

        const counts = Array(numDays).fill(0);

        let data = await model.find({
            created_at: {
                $gte: new Date(timestamps[numDays - 1]).toISOString(),
                $lt: new Date(today).toISOString()
            }
        }).exec();

        data.forEach(entry => {
            const entryDate = new Date(entry.created_at);
            const month = entryDate.getMonth() + 1;
            const day = entryDate.getDate();
            const dateString = `${month}.${day}`;
            const index = dates.indexOf(dateString);
            if (index !== -1) {
                counts[index]++;
            }
        });

        res.status(200).json({
            code: 200,
            message: "获取数据成功",
            result: {
                message: "获取数据成功",
                counts: counts.reverse(),// 数据
                dates: dates.reverse()// 日期
            },
        })
    } catch (err) {
        res.status(400).json({
            code: 400,
            message: err.message || "获取数据失败",
            result: {
                message: err.message || "获取数据失败",
            },
        })
    }

})



// 获取申请领养的增长数据
router.post('/echarts/applys', async (req, res) => {

    try {

        let { type = 'llmfb', time = 10 } = req.body
        console.log(time);

        let numDays = time; // 自定义要获取的天数
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 设置时、分、秒、毫秒为0

        const timestamps = [];
        for (let i = 0; i < numDays; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            timestamps.push(date.getTime());
        }

        const dates = timestamps.map((timestamp) => {
            const date = new Date(timestamp);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${month}.${day}`;
        });

        const counts = Array(numDays).fill(0);

        const data = await ApplyFor.aggregate([
            {
                $match: {
                    created_at: {
                        $gte: new Date(timestamps[numDays - 1]),
                        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // 结束时间加上一天的毫秒数
                    },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$created_at' },
                        month: { $month: '$created_at' },
                        day: { $dayOfMonth: '$created_at' },
                    },
                    count: { $sum: 1 },
                },
            },
        ]);

        data.forEach((entry) => {
            const year = entry._id.year;
            const month = entry._id.month;
            const day = entry._id.day;
            const dateString = `${month}.${day}`;
            const index = dates.indexOf(dateString);
            if (index !== -1) {
                counts[index] = entry.count;
            }
        });



        res.status(200).json({
            code: 200,
            message: "获取数据成功",
            result: {
                message: "获取数据成功",
                counts: counts.reverse(),// 数据
                dates: dates.reverse()// 日期
            },
        })


    } catch (err) {
        console.log(err);
        res.status(400).json({
            code: 400,
            message: err.message || "获取数据失败",
            result: {
                message: err.message || "获取数据失败",
            },
        })
    }

})



// 获取领养和未领养的比例
router.post('/echarts/applynook', async (req, res) => {

    try {
        let data = await ApplyFor.aggregate([
            {
                $group: {
                    _id: "$to_examine",
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    examineCount: { $sum: { $cond: [{ $eq: ["$_id", "examine"] }, "$count", 0] } },
                    nopassCount: { $sum: { $cond: [{ $eq: ["$_id", "nopass"] }, "$count", 0] } },
                    okCount: { $sum: { $cond: [{ $eq: ["$_id", "ok"] }, "$count", 0] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    data: [
                        {
                            value: "$nopassCount",
                            name: "已拒绝"
                        },
                        {
                            value: "$examineCount",
                            name: "待同意"
                        },
                        {
                            value: "$okCount",
                            name: "已领养"
                        }
                    ]
                }
            }
        ]);

        res.status(200).json({
            code: 200,
            message: "获取数据成功",
            result: {
                message: "获取数据成功",
                data: data[0].data
            },
        })


    } catch (err) {
        console.log(err);
        res.status(400).json({
            code: 400,
            message: err.message || "获取数据失败",
            result: {
                message: err.message || "获取数据失败",
            },
        })
    }
})




// 获取点击量前10的帖子
router.post('/echarts/clickcat', async (req, res) => {


    try {
        const top10Posts = await Cat.find()
            .sort({ clickCount: -1 })
            .limit(10);


        if (top10Posts.length <= 0) {
            top10Posts = []
        }

        res.status(200).json({
            code: 200,
            message: "获取数据成功",
            result: {
                message: "获取数据成功",
                data: top10Posts
            },
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            code: 400,
            message: err.message || "获取数据失败",
            result: {
                message: err.message || "获取数据失败",
            },
        })
    }




})





// 热词搜索
router.post('/echarts/searchhost', async (req, res) => {

    try {
        const top10Keywords = await SeatchHistory.aggregate([
            { $group: { _id: "$history", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            code: 200,
            message: "获取数据成功",
            result: {
                message: "获取数据成功",
                data: top10Keywords
            },
        })
    } catch (err) {
        console.log(err);
        res.status(400).json({
            code: 400,
            message: err.message || "获取数据失败",
            result: {
                message: err.message || "获取数据失败",
            },
        })
    }


})






module.exports = router