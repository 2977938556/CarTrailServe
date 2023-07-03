const express = require('express');
const path = require('path')
const router = express.Router();
const { v4: uuidv4 } = require('uuid')
const fs = require('fs');
const Story = require('../models/Story.js')
const { delay } = require('../utils/UniversalFn.js');// 通用函数
const { GetIp } = require('../utils/https.js')
const User = require('../models/User.js')
const qiniu = require('qiniu');
const { ImgUpdate } = require('../utils/ImgUpdate.js')





// 配置七牛云

// 上传故事模块
async function PushImg(imgBase64, types, serve = "cat") {
    // 出力图片模块
    let imgType = types.substring(types.lastIndexOf(".") + 1);// 图片类型
    const imgName = `${Math.random().toString(36).substring(2, 10)}${new Date().getTime()}.${imgType}`// 生成一个图片名称
    const base64Data = imgBase64.replace(/^data:image\/\w+;base64,/, '');// 这个是只截取base64后面的内容部分
    const buffer = Buffer.from(base64Data, 'base64');// 这个转换成bufer流

    return new Promise((resolve, reject) => {
        if (!buffer) {
            reject(new Error("转换图片失败"))
        } else {
            // 第三步：配置七牛云密钥和存储区域
            const accessKey = 'PS0cYPFZ5iCPBXDFD5CTQSUtdarhKgfnkaQrmP0v';
            const secretKey = 'QcvYXO5mH743vhaVeiQHaW3XBRMjx2SEX_QQri-W';
            const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

            // 需要保存的空间
            const options = {
                scope: 'abcdefg',
            };

            const config = new qiniu.conf.Config();
            config.zone = qiniu.zone.Zone_z2; // 选择存储区域，例如华南


            const putPolicy = new qiniu.rs.PutPolicy(options);
            const uploadToken = putPolicy.uploadToken(mac);

            const formUploader = new qiniu.form_up.FormUploader(config);
            const putExtra = new qiniu.form_up.PutExtra();

            formUploader.put(uploadToken, imgName, buffer, putExtra, function (respErr, respBody, respInfo) {
                if (respErr) {
                    return reject(new Error("文件上传失败"))
                }
                if (respInfo.statusCode === 200) {
                    imageUrl = `http://rwyswjtk7.hn-bkt.clouddn.com/${respBody.key}`;
                    return resolve({ imageUrl: imageUrl })
                } else {
                    return reject(new Error("文件上传失败"))
                }
            });
        }
    })

}




// 获取故事模块
router.post('/mjgs/storylist', async (req, res) => {
    console.log("获取成功");
    let { page = 1, pageSize = 3, store = -1, content, clickCount } = req.body
    let query = {}

    if (content) {
        query.content = content
    } else if (clickCount) {
        query.clickCount = clickCount
    }


    query.to_examine = 'pass'

    var data = await Story.find(query).populate('user_id').sort({ updated_at: store }).skip((page - 1) * pageSize).limit(pageSize);

    await delay(1000)

    res.status(201).json({
        code: 201,
        message: "发布成功",
        result: {
            message: "发布成功",
            data: data
        },
    });



})




// 发布故事
router.post('/mjgs/storysubmit', async (req, res) => {
    try {

        let { FormDataList, inputData } = req.body

        let imageUrl = await ImgUpdate(FormDataList)


        //  存储到数据库中
        let story = await Story.create({
            user_id: req.user.user_id,// 关联到User数据集合的自动生成的id
            title: inputData?.title || "",// 标题
            content: inputData.content,// 内容
            imageUrl: imageUrl,// 图片数据存储的是图片地址
        });

        res.status(201).json({
            code: 201,
            message: "发布成功",
            result: {
                message: "发布成功",
                data: story
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


// 基于id获取参加的活动列表
router.get('/mjgs/storydetail', async (req, res) => {

    try {
        let { _id } = req.query

        let detail = await Story.findById({ _id: _id }).populate('user_id')

        return res.status(200).json({
            code: 200,
            message: "获取成功",
            result: {
                message: "获取成功",
                data: detail,
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


