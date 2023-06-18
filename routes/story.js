const express = require('express');
const path = require('path')
const router = express.Router();
const { v4: uuidv4 } = require('uuid')
const fs = require('fs');
const Story = require('../models/Story.js')
const { delay } = require('../utils/UniversalFn.js');// 通用函数
const { GetIp } = require('../utils/https.js')
const User = require('../models/User.js')






// 上传故事模块
// 需要传递当前故事标题和故事内容还有故事的背景图片
async function PushImg(imgBase64, types, serve = "cat") {
    let savePath = path.join(__dirname, `../public/uploads/${serve}`);// 当前储存的地址
    let imgType = types.substring(types.lastIndexOf(".") + 1);// 图片的后缀名
    const randomChars = `${Math.random().toString(36).substring(2, 10)}${new Date().getTime()}.${imgType}`// 生成一个图片名称
    let imgUrl = path.join(savePath, randomChars);// 这个是获取用户的后缀名名称
    const base64Data = imgBase64.replace(/^data:image\/\w+;base64,/, '');// 这个是只截取base64后面的内容部分
    const buffer = Buffer.from(base64Data, 'base64');// 这个转换成bufer流


    return new Promise((resolve, reject) => {
        fs.writeFile(imgUrl, buffer, async (err) => {
            if (err) {
                reject(err)
            } else {
                // 这里返回
                let imgUrl = `http://${await GetIp()}:3000/public/uploads/${serve}/${randomChars}`
                resolve({
                    imgUrl: [imgUrl],//图片的服务器地址
                    savePath: savePath,// 图片的需要删除地址
                })
            }
        })
    })
}



// 分享故事模块
router.post('/release/story', async (req, res) => {
    try {
        // 查询当前用户是否
        let fowllow = await User.findOne({ user_id: req.user.username })

        if (fowllow.role == "ban") {
            return res.status(400).json({
                code: 400,
                message: "当前账户已已经关进小黑屋了",
                result: {
                    message: "当前账户已已经关进小黑屋了",
                    data: null
                },
            })
        }

        let { imgBase, content, imgtype, title = "" } = req.body

        // 将 base64 编码的数据转换为二进制数据
        let { imgUrl } = await PushImg(imgBase, imgtype, "storybook")


        // 存储到数据库中
        let story = await Story.create({
            user_id: fowllow._id,// 关联到User数据集合的自动生成的id
            title: title,// 标题
            content: content,// 内容
            imageUrl: imgUrl,// 图片数据存储的是图片地址
        });

        res.status(201).json({
            code: 201,
            message: "发布成功",
            result: {
                message: "发布成功",
                data: story
            },
        });

    } catch (error) {
        res.status(404).json({
            code: 404,
            message: "发布失败",
            result: {
                message: "发布失败",
                data: null
            },
        });
    }



})



// 获取故事模块
router.post('/release/storylist', async (req, res) => {
    let { page, pageSize } = req.body
    let query = {}

    var data = await Story.find(query).populate('user_id').sort({ updated_at: -1 }).skip((page - 1) * pageSize).limit(pageSize);


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






module.exports = router;








