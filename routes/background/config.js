const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid')
let User = require('../../models/User.js')
let { AdverTisement, Notice } = require('../../models/Config.js')
const { ImgUpdate } = require('../../utils/ImgUpdate.js')
const { delay } = require('../../utils/UniversalFn.js')// 通用函数





// 上传广告模块
router.post('/config/guangpuhs', async (req, res) => {

    try {
        // 分别是 文件数据，input数据，用户数据
        let { FormDataList = "", inputData = "", UserDat = "" } = req.body


        if (inputData.weight > 5) {
            throw new Error("权重不能大于5")
        }

        if (await AdverTisement.countDocuments({ column: inputData.column }) + 1 > 5) {
            throw new Error("最多只能发布五条广告")
        } else {
            // 这里是上传图片 
            let imgList = await ImgUpdate(FormDataList)

            let columndata = await AdverTisement.find({ column: inputData.column });

            if (columndata.length > 0) {
                const sameWeightData = columndata.find((data) => data.weight === inputData.weight);
                if (sameWeightData) {
                    const unusedWeights = [1, 2, 3, 4, 5].filter((weight) => !columndata.some((data) => data.weight === weight));

                    if (unusedWeights.length > 0) {
                        sameWeightData.weight = unusedWeights[0];
                        // 重新保存数据库
                        await sameWeightData.save();
                    }
                }
            }

            // 到了这里就没有相同权重了
            await delay(100)
            let advData = await AdverTisement.create({
                imageUrl: imgList[0],
                title: inputData.title,
                weight: inputData.weight,
                column: inputData.column,
                to_id: inputData.to_id,
                pagepath: inputData.pagepath,
                user_id: UserDat._id
            })

            await delay(1000)
            // 存储成功返回数据给前端
            return res.status(201).json({
                code: 201,
                message: "上传成功",
                result: {
                    message: "上传成功",
                    data: advData
                },
            });
        }


    } catch (err) {
        console.log(err);
        res.status(400).json({
            code: 400,
            message: err.message || "发布失败，请重试",
            result: {
                message: err.message || "发布失败，请重试",
            },
        })
    }

})


// 获取数据
router.post('/config/guangaodata', async (req, res) => {
    let { search, stor = 0, column = "home" } = req.body;

    try {
        let query = {
            column: column,
        };

        if (search) {
            const regex = new RegExp(search, "i");
            query.title = { $regex: regex };
        }




        const advertisements = await AdverTisement.find(query).sort({ created_at: stor === 1 ? -1 : 1 }).exec();

        // 存储成功返回数据给前端
        await delay(1000)
        return res.status(200).json({
            code: 200,
            message: "上传成功",
            result: {
                message: "上传成功",
                data: advertisements
            },
        });

    } catch (err) {
        console.log(err);
        res.status(400).json({
            code: 400,
            message: err.message || "发布失败，请重试",
            result: {
                message: err.message || "发布失败，请重试",
            },
        })
    }
});



// 删除数据批量删除
router.post('/config/guangaodatadelete', async (req, res) => {

    try {

        let { tabArray = [] } = req.body;

        if (tabArray?.length == 0 || !tabArray) {
            throw new Error("删除数据失败");
        }

        if (tabArray.length == 0) {
            throw new Error("数据为空");
        }

        // 查找全部的数据

        const deleteIds = tabArray.map(item => item._id);

        // 删除满足条件的数据
        let ss = await AdverTisement.deleteMany({ _id: { $in: deleteIds } });


        let tabArraysData = await AdverTisement.find();

        // 返回删除后的数据给前端
        return res.status(200).json({
            code: 200,
            message: "删除成功",
            result: {
                message: "删除成功",
                data: tabArraysData
            },
        });

    } catch (err) {
        console.log(err);
        res.status(400).json({
            code: 400,
            message: err.message || "发布失败，请重试",
            result: {
                message: err.message || "发布失败，请重试",
            },
        })
    }
});


// 修改接口
router.post('/config/editguangpuhs', async (req, res) => {
    try {
        // 分别是 文件数据，input数据，用户数据
        let { FormDataList = "", inputData = "", UserDat = "", EditData = "" } = req.body

        if (inputData.weight > 5) {
            throw new Error("权重不能大于5")
        }


        if (EditData === "") {
            throw new Error("未查询到该对象")
        }




        // 查询出需要修改的对象
        let datas = await AdverTisement.findById(EditData._id)


        if (datas == null) {
            throw new Error("修改失败")
        }


        // 查询出同一类别的
        let columndata = await AdverTisement.find({ column: inputData.column });

        // 这里是需要写一个需要修改图片的
        if (FormDataList[0].size > 0) {
            let imgList = await ImgUpdate(FormDataList)
            if (imgList.length != 0) {
                datas.imageUrl = imgList[0] || 'https://img.js.design/assets/smartFill/img193164da6ef470.jpg'
            } else {
                throw new Error("修改失败图片上传失败")
            }
        }

        // 修改权重
        if (columndata.length > 0) {
            // 这里是找出与修改相同的权重的对象
            const sameWeightData = columndata.find((data) => data.weight === inputData.weight);
            // 这里判断是否有相同权重
            if (sameWeightData) {
                // 如果有那么就基于所有的column类型查询出1235中没有出现的
                const unusedWeights = [1, 2, 3, 4, 5].filter((weight) => !columndata.some((data) => data.weight === weight));

                // 这里就是修该为第一额权重的
                if (unusedWeights.length > 0) {
                    sameWeightData.weight = unusedWeights[0];
                    // 重新保存数据库【因为携带了_id所以可以直接进行保存修改】
                    await sameWeightData.save();
                }
            }
        }

        // 修改基础数据
        datas.weight = inputData.weight || datas.weight
        datas.column = inputData.column || datas.column
        datas.title = inputData.title || datas.title
        datas.to_id = inputData.to_id || datas.to_id
        datas.pagepath = inputData.pagepath || datas.pagepath
        datas.user_id = inputData.user_id || datas.user_id

        datas.to_examine = EditData.to_examine || datas.user_id
        datas.updated_at = new Date()


        // // 持久化保存
        let result = await datas.save()


        await delay(1000)
        // 存储成功返回数据给前端
        return res.status(201).json({
            code: 201,
            message: "修改成功",
            result: {
                message: "修改成功",
                data: result
            },
        });




    } catch (err) {
        console.log(err);
        res.status(400).json({
            code: 400,
            message: err.message || "发布失败，请重试",
            result: {
                message: err.message || "发布失败，请重试",
            },
        })
    }

})




// 上传通知模块
router.post('/config/messagepush', async (req, res) => {
    try {
        let { inputData = "", UserDat = "" } = req.body

        if (inputData == "" || UserDat == "") {
            throw new Error("上传数据失败")
        }



        let MessageList = await Notice.find({ column: inputData.column })


        // // 判断是否需要进行添加
        if (MessageList.length > 0) {
            throw new Error("每一个模块只能发布一个通知")
        }


        let NewMessage = await Notice.create({
            title: inputData.title,// 标题
            column: inputData.column,// 所属栏目
            pagepath: inputData.pagepath,// 页面路径
            user_id: UserDat._id,// 关联到User数据集合的自动生成的id
            to_id: inputData.to_id// 跳转的id
        })

        await delay(1000)
        // 返回删除后的数据给前端
        return res.status(200).json({
            code: 200,
            message: "添加通知成功",
            result: {
                message: "添加通知成功",
                data: NewMessage
            },
        });


    } catch (err) {
        console.log(err);
        res.status(400).json({
            code: 400,
            message: err.message || "发布失败，请重试",
            result: {
                message: err.message || "发布失败，请重试",
            },
        })
    }

})


// 获取通知数据模块
router.post('/config/messagedata', async (req, res) => {
    let { search = "", column = "home" } = req.body;


    try {
        let query = {
            column: column,
        };

        if (search != "") {
            const regex = new RegExp(search, "i");
            query.title = { $regex: regex };
        }

        const advertisements = await Notice.find(query);

        // 存储成功返回数据给前端
        await delay(1000)
        return res.status(200).json({
            code: 200,
            message: "上传成功",
            result: {
                message: "上传成功",
                data: advertisements
            },
        });

    } catch (err) {
        console.log(err);
        res.status(400).json({
            code: 400,
            message: err.message || "发布失败，请重试",
            result: {
                message: err.message || "发布失败，请重试",
            },
        })
    }
});





// 修改通知模块
// 修改接口
router.post('/config/editmessage', async (req, res) => {
    try {
        // 分别是 文件数据，input数据，用户数据 需要修改的
        let { inputData = "", UserDat = "", EditData = "" } = req.body

        if (inputData == "" || UserDat == "" || EditData == "") {
            throw new Error("修改失败")
        }


        let datas = await Notice.findById(EditData._id)

        if (datas == null) {
            throw new Error("当前修改对象不存在")
        }



        // 修改基础数据
        datas.column = inputData.column || datas.column
        datas.title = inputData.title || datas.title
        datas.pagepath = inputData.pagepath || datas.pagepath
        datas.user_id = inputData.user_id || datas.user_id
        datas.to_examine = EditData.to_examine || datas.to_examine
        datas.updated_at = new Date()
        datas.to_id = inputData.to_id || datas.to_id

        // // 持久化保存
        let result = await datas.save()




        await delay(1000)
        // 存储成功返回数据给前端
        return res.status(201).json({
            code: 201,
            message: "修改成功",
            result: {
                message: "修改成功",
                data: result
            },
        });




    } catch (err) {
        console.log(err);
        res.status(400).json({
            code: 400,
            message: err.message || "发布失败，请重试",
            result: {
                message: err.message || "发布失败，请重试",
            },
        })
    }

})


// 删除单个模块
router.post('/config/messagedelete', async (req, res) => {

    try {

        let { tabArray = [] } = req.body;

        if (tabArray?.length == 0 || !tabArray) {
            throw new Error("删除数据失败");
        }

        // 查找全部的数据
        const deleteIds = tabArray.map(item => item._id);

        // 删除满足条件的数据
        let ss = await Notice.deleteMany({ _id: { $in: deleteIds } });


        let tabArraysData = await Notice.find();

        // 返回删除后的数据给前端
        return res.status(200).json({
            code: 200,
            message: "删除成功",
            result: {
                message: "删除成功",
                data: tabArraysData
            },
        });

    } catch (err) {
        console.log(err);
        res.status(400).json({
            code: 400,
            message: err.message || "发布失败，请重试",
            result: {
                message: err.message || "发布失败，请重试",
            },
        })
    }
});





module.exports = router
