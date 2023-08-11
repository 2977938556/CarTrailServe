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
const { StoryComment, StoryReply } = require('../models/StoryComment.js')
const { GetCommentDetailData, GetCommentReplay, GetCommentHfreplay, GetPushStoreLink } = require('../utils/comment.js')




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


// 获取故事列表模块
router.post('/mjgs/storylist', async (req, res) => {
    let { page = 1, pageSize = 3, store = -1, content, clickCount } = req.body
    let query = {}

    if (content) {
        query.content = content
    } else if (clickCount) {
        query.clickCount = clickCount
    }


    query.to_examine = 'pass'

    var data = await Story.find(query).populate('user_id').sort({ updated_at: store }).skip((page - 1) * pageSize).limit(pageSize);

    await delay(100)

    res.status(201).json({
        code: 201,
        message: "获取数据成功",
        result: {
            message: "获取数据成功",
            data: data
        },
    });



})


// 发布故事模块
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


// 基于id获取当前的故事详情
router.get('/mjgs/storydetail', async (req, res) => {

    try {
        let { _id } = req.query

        let detail = await Story.findById({ _id: _id }).populate('user_id')

        detail.clickCount++

        await detail.save()

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


// 基于故事id获取进行分页获取评论的数据
router.get('/mjgs/detail/comment', async (req, res,) => {
    try {
        // 携带评论 
        let { _id, page = 1, pageSize = 5, sort = 1 } = req.query


        const skip = (page - 1) * pageSize; // 跳过的数据量

        // 这里获取总条数
        const total = await StoryComment.countDocuments({ StoryId: _id });

        const commitData = await StoryComment.find({ StoryId: _id })
            .populate([
                { path: "commenter" },
                {
                    path: "replies",
                    populate: [
                        {
                            path: "replier",
                            model: "User",
                        },
                        {
                            path: "parentId",
                            model: "StoryComment",
                        },
                    ],
                },
            ]).sort({ createTime: sort })
            .skip(skip)
            .limit(pageSize);

        await delay(100)
        return res.status(200).json({
            code: 200,
            message: "数据返回成功",
            result: {
                message: "数据返回成功",
                data: commitData,
                total,
            }
        })


    } catch (err) {
        console.log(err);
        return res.status(400).json({
            code: 400,
            message: "或数据失败",
            result: {
                message: "或数据失败",
                data: null

            }
        })
    }

})

// 发布评论
router.post('/mjgs/detail/replay', async (req, res,) => {
    try {
        // 携带评论 
        let { content, _id, user_id } = req.body

        // 这里是添加评论的数据
        let commentData = new StoryComment({
            StoryId: _id,
            content: content,
            commenter: user_id,
            replyCount: 0,
        })
        // 这里是储存用户数据模块
        let result = await commentData.save()



        let data = await StoryComment.findById({ _id: result._id.toString() }).populate([{
            path: "commenter"
        }])


        return res.status(200).json({
            code: 200,
            message: "数据返回成功",
            result: {
                message: "数据返回成功",
                data: data

            }
        })


    } catch (err) {
        console.log(err);
        return res.status(400).json({
            code: 400,
            message: "发布评论失败",
            result: {
                message: "发布评论失败",
                data: null

            }
        })
    }

})









// 会需要通用的模块

// 基于评论的id返回主要的评论数据
router.get('/comment/detail', async (req, res) => {
    try {
        // _id是需要查询的评论id，type是需要查询哪个模块的数据
        let { _id, type } = req.query
        // 需要传递一个当前的id和需要查询的数据模块
        let data = await GetCommentDetailData(_id, type)

        return res.status(200).json({
            code: 200,
            message: "数据返回成功",
            result: {
                message: "数据返回成功",
                data: data,
            }
        })

    } catch (err) {

        return res.status(400).json({
            code: 400,
            message: "获取数据失败",
            result: {
                message: "获取数据失败",
                data: null,
            }
        })
    }

})


// 基于父级评论的进行分页的查询出分页的回复的数据
router.get('/replay/detail', async (req, res) => {
    try {
        // 分别是 当前页面 需要返回多少数据 父级评论的id，是哪个模块的
        let { page, pageSize = 1, parentId, type } = req.query

        let data = await GetCommentReplay({ page, pageSize, parentId, type })



        return res.status(200).json({
            code: 200,
            message: "数据返回成功",
            result: {
                message: "数据返回成功",
                data: data,
            }
        })

    } catch (err) {
        return res.status(400).json({
            code: 400,
            message: "获取数据失败",
            result: {
                message: "获取数据失败",
                data: null,
            }
        })
    }



})

// 发布回复评论
router.post('/mjgs/detail/hfreplay', async (req, res) => {
    try {
        // 分别是回复的内容 回复的评论id  回复的用户id
        let { content, commentId, user_id, type } = req.body


        let data = await GetCommentHfreplay({ content, commentId, user_id, type })

        return res.status(200).json({
            code: 200,
            message: "数据返回成功",
            result: {
                message: "数据返回成功",
                data: data,
            }
        })


    } catch (err) {
        console.log(err);
        return res.status(400).json({
            code: 400,
            message: "回复失败",
            result: {
                message: "回复失败",
                data: null,
            }
        })
    }
})

// 点赞模块
router.post('/mjgs/detail/PushStoryLike', async (req, res) => {
    try {
        // 需要 用户id 和点赞的评论
        let { userId, commentId, type } = req.body


        let result = await GetPushStoreLink({ userId, commentId, type })

        return res.status(200).json({
            code: 200,
            message: "点赞成功",
            result: {
                message: "点赞成功",
                data: result,
            }
        })

    } catch (err) {
        console.log(err);
        return res.status(400).json({
            code: 400,
            message: "点赞失败",
            result: {
                message: "点赞失败",
                data: null,
            }
        })
    }
})


module.exports = router;


