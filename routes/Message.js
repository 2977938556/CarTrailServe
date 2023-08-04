const express = require('express');
const router = express.Router();
let User = require('../models/User.js')
let Cat = require('../models/Cat.js')
let { ApplyFor } = require('../models/Adopt.js')





// 申请领养模块
router.post('/message/apply', async (req, res) => {
    try {
        let { _id, Statusis = 1, } = req.body

        let data = null

        // 这里基于1或者2获取不同的数据
        if (Statusis == 1) {
            data = await ApplyFor.find({ fuser_id: _id }).populate('user_id').populate("cat_id").populate("fuser_id")
        } else if (Statusis == 2) {
            data = await ApplyFor.find({ user_id: _id }).populate('user_id').populate("cat_id").populate("fuser_id")
        }


        if (data == null) {
            return res.status(200).json({
                code: 200,
                message: "当前没有申请哦",
                result: {
                    message: "当前没有申请哦",
                    data: [],
                }
            })

        }

        return res.status(200).json({
            code: 200,
            message: "获取数据成功",
            result: {
                message: "获取数据成功",
                data: data,
            }
        })


    } catch (Err) {
        console.log(Err);
        return res.status(400).json({
            code: 400,
            message: "获取失败",
            result: {
                message: "获取失败",
                data: null,
            }
        })
    }

})



// 同意或者取消申请模块
router.post('/message/applupush', async (req, res) => {
    try {
        let { _id, statuss, message = "暂无留言" } = req.body

        let AppData = await ApplyFor.findById(_id).populate('cat_id').populate('user_id').populate('fuser_id');
        let catData = await Cat.findById(AppData.cat_id._id).populate('user_id')


        if (AppData == null || catData == null) {
            throw new Error('找不到对应的申请记录');
        }

        if (statuss !== "no" && (AppData.to_examine === 'ok' || catData.to_examine === 'ok')) {
            throw new Error('该猫猫已经被领养了');
        }


        // 这里判断是否有数据如果有的话就可以基于参数进行判断同意或者取消
        if (AppData && catData) {

            if (statuss === 'ok') {
                AppData.to_examine = 'ok'// 状态修改为 已经领养
                AppData.updated_at = new Date()// 更新领养时间


                catData.Successful_adoption = true// 猫的数据修改为已领养的状态
                catData.to_examine = 'ok'// 猫的数据修改为已领养的状态

            } else if (statuss === 'no') {
                AppData.to_examine = 'nopass'
            }

            // 这个是设置留言
            AppData.user_content = message

            let resCopy = await AppData.save()
            let catDataCopy = await catData.save()

            // 合并数据
            resCopy.cat_id = catDataCopy

            // 返回成功状态
            return res.status(200).json({
                code: 200,
                message: statuss == 'ok' ? '同意成功' : '拒绝成功',
                result: {
                    message: statuss == 'ok' ? '同意成功' : '拒绝成功',
                    data: resCopy,
                }
            })
        }
    } catch (error) {
        console.log(error, "错误");
        return res.status(400).json({
            code: 400,
            message: error.message,
            result: {
                message: error.message,
                data: null,
            }
        })
    }
})



// 基于id和状态修改或者删除掉申请
router.post('/message/myapplypush', async (req, res) => {
    try {
        let { _id, statuss, message = "默认", user_id } = req.body

        let AppData = await ApplyFor.findOne({ user_id: user_id }).populate('cat_id').populate('user_id').populate('fuser_id');

        if (AppData) {
            if (statuss === 'ok') {
                await AppData.remove();

                // 返回成功状态
                return res.status(200).json({
                    code: 200,
                    message: "删除成功",
                    result: {
                        message: "删除成功",
                        data: null,
                    }
                });
            }

            if (statuss === 'no') {
                AppData.content = message
                AppData.updated_at = new Date();
                await AppData.save()
            }

            return res.status(200).json({
                code: 200,
                message: "修改成功",
                result: {
                    message: "修改成功",
                    data: null,
                }
            });
        } else {
            throw new Error('找不到对应的申请记录');
        }

    } catch (error) {
        console.log(error, "错误");
        return res.status(400).json({
            code: 400,
            message: error.message,
            result: {
                message: error.message,
                data: null,
            }
        })
    }
})



module.exports = router
