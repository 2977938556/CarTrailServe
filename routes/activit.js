
const express = require('express');
const router = express.Router();
const User = require('../models/User.js')
const { delay } = require('../utils/UniversalFn.js');// 通用函数
const { GetDaat, GetQuery } = require('../utils/sh.js')// 获取数据模块和设置查询参数模块
const { Activity, Participant } = require('../models/Activit.js')// 分别是一个活动一个是用户报名的模块


// 获取猫迹活动的数据
router.post('/home/mjhddata', async (req, res) => {
    let { page = 1, pageSize = 10, type, searchVal = "", typeofs = "mjhd", store = 1 } = req.body

    // 传递参数获取查询条件查询条件
    let query = GetQuery(type, searchVal)

    let data = null
    let total = 0
    let pageCount = 0

    // 这个是用于获取数据的模块
    let stores = { updated_at: store }

    // 这里我们做一个判断
    if (typeofs == "mjhd") {
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

// 获取活动详情页面的数据
// 包括报名人数等数据【待获取】
router.get('/home/mjgsdetail', async (req, res) => {
    try {
        let { _id } = req.query

        let detail = await Activity.findById({ '_id': _id }).populate('participant.user_id')

        return res.status(200).json({
            code: 200,
            message: "数据返回成功",
            result: {
                message: "数据返回成功",
                data: detail,
            }
        })
    } catch (error) {
        return res.status(404).json({
            code: 404,
            message: "获取数据失败",
            result: {
                message: "获取数据失败",
                data: null,
            }
        })
    }



})

// 参与活动
router.post('/home/mjhdsubmit', async (req, res) => {
    try {
        let { _id, phone, message } = req.body

        // 获取当前用户的数据
        let UserDat = await User.findOne({ user_id: req.user.username })
        // 基于当前用户查询出活动数据
        let PushActivity = await Participant.findOne({ user_id: UserDat._id.toString() })
        // 基于当前活动id查询出活动的数据
        let ActivitData = await Activity.findById({ _id: _id })


        if (!ActivitData) {
            return res.status(404).json({
                code: 404,
                message: "没有当前活动，可能删除了",
                result: {
                    message: "没有当前活动，可能删除了",
                    data: null,
                }
            })
        }
        if (PushActivity === null) {
            let data = await Participant.create({
                user_id: UserDat._id,
                activities: [
                    {
                        act_id: _id,
                        phone: phone,
                        message: message,
                    }
                ]
            });


            // 这里还需要再活动中进行保存
            ActivitData.participant.push({
                user_id: UserDat._id.toString(),
                phone: phone,
                message: message,
            })

            await ActivitData.save()

            return res.status(200).json({
                code: 200,
                message: "报名成功",
                result: {
                    message: "数据返回成功",
                    data: data,
                }
            })
        }


        if (PushActivity) {
            // 找到了需要查
            const userIds = PushActivity.activities.map(user => String(user.act_id));

            let index = userIds.findIndex(item => item == _id)

            if (index > -1) {
                return res.status(404).json({
                    code: 404,
                    message: "不能重复报名",
                    result: {
                        message: "不能重复报名",
                        data: null,
                    }
                })
            } else if (index < 0) {
                // // 这里是需要进行追加数据
                PushActivity.activities.push({
                    act_id: _id,
                    phone: phone,
                    message: message,
                })

                // 持久化存储数据
                let data = await PushActivity.save()


                // 这里还需要再活动中进行保存
                ActivitData.participant.push({
                    user_id: UserDat._id.toString(),
                    phone: phone,
                    message: message,
                })
                await ActivitData.save()

                return res.status(200).json({
                    code: 200,
                    message: "报名成功",
                    result: {
                        message: "数据返回成功",
                        data: data,
                    }
                })
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            code: 404,
            message: "服务器错误",
            result: {
                message: "服务器错误",
                data: null,
            }
        })
    }
})

// 基于id获取参加的活动列表
router.get('/home/mjhdsubmit', async (req, res) => {

    try {
        let { _id } = req.query

        let ParticipantData = await Participant.findOne({ user_id: _id }).populate('activities.act_id')

        await delay(3000)
        return res.status(200).json({
            code: 200,
            message: "获取成功",
            result: {
                message: "获取成功",
                data: ParticipantData,
            }
        })

    } catch (err) {
        console.log(err);
        return res.status(404).json({
            code: 404,
            message: "服务器错误",
            result: {
                message: "服务器错误",
                data: null,
            }
        })
    }


})

module.exports = router;
