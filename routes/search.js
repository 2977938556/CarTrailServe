const { SeatchHistory } = require('../models/Search.js')
const express = require('express');
const router = express.Router();
let User = require('../models/User.js')
let Cat = require('../models/Cat.js')
const { delay } = require('../utils/UniversalFn.js');// 通用函数
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


// 搜索内容
router.post('/search/main', async (req, res) => {
    try {

        // 一个是搜索内容 一个是类型 比如是用户还是谁
        let { search = "", types, _id } = req.body

        if (_id == "") {
            throw new Error("获取数据失败")
        }

        let data = []

        //查询条件
        let searchQuery


        // 这里是查找cat 帖子模块
        if (types === 'cat') {
            searchQuery = {
                $and: [
                    {
                        $or: [
                            { title: { $regex: search, $options: 'i' } },
                            { content: { $regex: search, $options: 'i' } },
                            { lable: { $in: [search] } }
                        ]
                    },
                    { $or: [{ to_examine: 'pass' }, { to_examine: 'ok' }] }
                ]
            }

            data = await Cat.find(searchQuery)
        } else if (types === 'user') {
            searchQuery = {
                $or: [
                    { username: { $regex: search, $options: 'i' } },
                    { slogin: { $regex: search, $options: 'i' } },
                ]
            }

            data = await User.find(searchQuery)
        }




        // 保存搜索记录
        let his = await SeatchHistory.find({ user_id: _id, history: search })

        if (his.length == 0) {
            SeatchHistory.create({
                user_id: _id,
                history: search
            })
        }



        // await delay(100)
        return res.status(200).json({
            code: 200,
            message: "获取成功",
            result: {
                message: "获取成功",
                data: data
            },
        });



    } catch (err) {
        console.log(err);
        return res.status(400).json({
            code: 400,
            message: err.message || "获取数据错误",
            result: {
                message: err.message || "获取数据错误",
                data: null
            }
        })
    }
})

// 获取所有的历史记录
router.post('/search/historyall', async (req, res) => {
    try {
        let { _id } = req.body

        if (_id == "") {
            throw new Error("获取历史记录失败")
        }

        let data = await SeatchHistory.find({ user_id: _id })

        // await delay(100)
        return res.status(200).json({
            code: 200,
            message: "获取成功",
            result: {
                message: "获取成功",
                data: data
            },
        });


    } catch (err) {
        console.log(err);
        return res.status(400).json({
            code: 400,
            message: err.message || "获取数据错误",
            result: {
                message: err.message || "获取数据错误",
                data: null
            }
        })
    }

})


router.post('/search/deletahistory', async (req, res) => {
    try {
        let { _id } = req.body


        if (_id == "") {
            throw new Error("删除失败")
        }

        let data = await SeatchHistory.deleteMany({ user_id: _id })

        await delay(100)
        return res.status(200).json({
            code: 200,
            message: "删除成功",
            result: {
                message: "删除成功",
                data: data
            },
        });

    } catch (err) {
        console.log(err);
        return res.status(400).json({
            code: 400,
            message: err?.message || "获取数据错误",
            result: {
                message: err?.message || "获取数据错误",
                data: null
            }
        })
    }
})


module.exports = router




