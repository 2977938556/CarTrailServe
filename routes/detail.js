const express = require('express');
const router = express.Router();
let User = require('../models/User.js')
let Cat = require('../models/Cat.js')
let Collect = require('../models/Collect.js')
let { History, Like } = require('../models/CatHistory.js')
let { Comment, Reply } = require('../models/Comment.js')

const { decryptPssword } = require('../utils/encryption.js')
const { delay } = require('../utils/UniversalFn.js')// 通用函数
const mongoose = require('mongoose');
const { v1, v4 } = require('uuid')




// 这个是用于判断是否有当前的数据表的情况下
async function checkCollectionExists(collectionName, user_id) {
    const collections = await mongoose.connection.db.listCollections().toArray();
    return collections.some(collect => collect.name === collectionName);
}

// 获取帖子详情的数据
router.get('/detail/cate', async (req, res) => {
    try {
        // 这里我先是查找到用户的帖子在从帖子中获取user的数据
        let DetailData = await Cat.findOne({ cat_id: req.query.id }).populate('user_id')


        // 这里还需要查找一条评价信息
        let commentData = await Comment.find({ CatId: DetailData._id }) || ""


        // 这里是没有该帖子的数据需要阻断后面的数据返回
        if (!DetailData) {
            return res.status(400).json({
                code: 400,
                message: "数据获取失败",
                result: {
                    message: "数据获取失败",
                    data: null
                }
            })
        }
        // 这里是查早 是否有HistorySchem数据表集合
        if (await checkCollectionExists("historyschems") == false) {
            // 那么就需要新建一个历史记录的数据表
            // 基于当前的数据新建当前的数据集，基于当前的用户数据新建一个新的历史记录的数据集合
            await History.create({
                user_id: req.user.username,
                histories: [
                    {
                        type: "SEARCH",
                        cat_id: req.query.id
                    }
                ],
            });
        }

        // 这里是可能有用户的数据所以需要通过用户的id进行查找是否有该用户的历史记录
        let HistoryData = await History.findOne({ user_id: req.user.username });

        // 这里是没有找到情况 新建一个新的用户任务集合并返回数据
        if (HistoryData == null) {
            await History.create({
                user_id: req.user.username,
                histories: [
                    {
                        type: "SEARCH",
                        cat_id: req.query.id
                    }
                ],
            })

        }
        // 因为前面插入数据后不会立马获取数据所以需重新获取数据
        HistoryData = await History.findOne({ user_id: req.user.username });
        // 这里是验证是否有历史记录模块的数据
        HistoryData = await History.findOne({ user_id: req.user.username });
        // 这里就是需要基于当前提交的cat_id进行查早
        let index = HistoryData?.histories?.findIndex(item => item.cat_id == req.query.id)
        // 这里是表示没有找到
        if (index >= 0) {
            // 这里是删除掉元素再次添加进入到数据库中
            HistoryData.histories.splice(index, 1)
            HistoryData.histories.push({
                type: 'SEARCH',
                cat_id: req.query.id,
            })

        } else if (index < 0) {
            // 这里是没有找到数据所以直接添加数据
            HistoryData.histories.push({
                type: 'SEARCH',
                cat_id: req.query.id,
            })
        }
        // 持久化被修改的数据
        await HistoryData.save()




        // 喜欢的数据收集

        // 这里是查早 喜欢的数据Link
        if (await checkCollectionExists("likeschems") == false) {
            // // 那么就需要新建一个Like的数据表
            // // 基于当前的数据新建当前的数据集，基于当前的用户数据新建一个新的历史记录的数据集合
            await Like.create({
                user_id: req.user.username,
                like: [...DetailData.lable]
            });


            // // 由于是第一次添加所以呢就不会继续向后面执行
            return res.status(200).json({
                code: 200,
                message: "数据获取成功",
                result: {
                    message: "数据获取成功",
                    data: DetailData
                }
            })
        }

        // 这里是可能有用户的数据所以需要通过用户的id进行查找是否有该用户的历史记录
        let LikeData = await Like.findOne({ user_id: req.user.username });

        // 这里表示可能没有当前用户的数据
        if (!LikeData) {
            let data = await Like.create({
                user_id: req.user.username,
                like: [...DetailData.lable]
            })
        }

        // 这里是有数据但是我们可以将数据保存起来
        LikeData = await Like.findOne({ user_id: req.user.username });
        DetailData.lable.forEach((item, index) => {
            if (item != LikeData.like[index]) {
                LikeData.like.push(DetailData.lable[index])
            }
        })

        await LikeData.save()


        // 经过上面的验证所以呢就可以返回最终的数据
        return res.status(200).json({
            code: 200,
            message: "数据获取成功",
            result: {
                message: "数据获取成功",
                data: { DetailData, commentData }
            }
        })



    } catch (e) {
        console.log(e);
        res.status(400).json({
            code: 400,
            message: "获取数据失败",
            result: {
                message: "获取数据失败",
                data: null

            }
        })
    }

});

// 获取用户用户收藏的数据
router.get('/detail/collect', async (req, res) => {
    let collect_id = v1()
    // 这里我们先查询是否有这个集合如果没有那么就创建，如果有那么就返回数据回去，
    let mark = await checkCollectionExists("collectschems")

    // 这里是没有收藏的集合
    if (mark == false) {
        // 创建集合
        // 创建一个空的集合
        await Collect.create({
            collect_id: collect_id,
            user_id: req.query.user_id,
            bookmarks: [],
        })
    }

    // 这里是表示有集合但是还是需要查询该用户是否有数据
    if (mark) {
        // 不等于的情况下
        let CollectData = await Collect.findOne({ user_id: req.query.user_id })

        // 没有该用户查询的情况
        if (!CollectData) {
            await Collect.create({
                collect_id: collect_id,
                user_id: req.query.user_id,
                bookmarks: [],
            })
        }


        return res.status(200).json({
            code: 200,
            message: "查询成功",
            result: {
                message: "查询成功",
                data: CollectData
            }
        })

    }

})


// 用户点击收藏与取消收藏
router.post('/detail/collect', async (req, res) => {

    // 第一个是作品的数据
    // 第二个是作品是否被收藏，
    // 第三个是作品的数据
    let { DetailData, cat_id, userData, collectFlage } = req.body


    try {

        // 思路大概是这样的
        // 当为false表示没有被收藏所以需要进行收藏
        // 当为true则反之，需要被删除里面的元素
        if (collectFlage == false) {
            let ceshi = await Collect.findOne({ user_id: userData.user_id })
            ceshi.bookmarks.push({
                created_at: Date.now(),
                user_id: DetailData.user_id.user_id,// 发布者的id
                cat_id: DetailData.cat_id,// 发布者的帖子id
                title: DetailData.title// 发布者的帖子标题
            })

            // 持久化存储
            await ceshi.save()

            return res.status(200).json({
                code: 200,
                message: "收藏成功",
                result: {
                    message: "收藏成功",
                    data: ceshi
                }
            })
        }


        // 需要被删除
        if (collectFlage == true) {
            // 根据用户的id进行删除
            let ceshi = await Collect.findOne({ user_id: userData.user_id })
            let index = ceshi?.bookmarks.findIndex(item => item.cat_id == cat_id)
            ceshi.bookmarks.splice(index, 1)

            // 持久化存储
            await ceshi.save()
            return res.status(200).json({
                code: 200,
                message: "取消收藏成功",
                result: {
                    message: "取消收藏成功",
                    data: ceshi
                }
            })
        }
    } catch (err) {
        return res.status(400).json({
            code: 400,
            message: "获取数据失败",
            result: {
                message: "获取数据失败",
                data: []
            }
        })
    }

})

// 推荐的数据集合
router.get('/detail/recommend', async (req, res) => {

    try {
        // 获取当前用户的喜欢
        let like = await Like.findOne({ user_id: req.user.username })


        const queryStr = like.like

        function randomEvenNumber(start, end) {
            const range = (end - start) / 2;
            const randomRange = Math.floor(Math.random() * (range + 1));
            const randomEvenNumber = start + randomRange * 2;
            // if ()
            return randomEvenNumber;
        }

        const number = randomEvenNumber(8, 18);



        let RemmendData = await Cat.find({ lable: { $in: queryStr } }).limit(number);

        return res.status(200).json({
            code: 200,
            message: "数据返回成功",
            result: {
                message: "数据返回成功",
                data: RemmendData,
            }
        })

    } catch (e) {
        return res.status(400).json({
            code: 400,
            message: "数据返回成功",
            result: {
                message: "数据返回成功",
                data: RemmendData,
            }
        })

    }
})


// 存储评论的模块
router.post('/detail/comment', async (req, res) => {
    try {
        let { content, commenter, CatId } = req.body

        // 这里是添加评论的数据
        let commentData = new Comment({
            CatId: CatId,
            content: content,
            commenter: commenter,
            replyCount: 0,
        })
        // 这里是储存用户数据模块
        let result = await commentData.save()


        //  这里我们查询到用户的数据并添加进入到需要返回的数据中
        let data = await User.findById(result.commenter)
        result.commenter = data

        return res.status(200).json({
            code: 200,
            message: "数据返回成功",
            result: {
                message: "数据返回成功",
                data: result

            }
        })
    } catch (e) {
        return res.status(400).json({
            code: 400,
            message: "发布评论失败",
            result: {
                message: "发布评论失败",
                data: [],
            }
        })
    }


})



// 获取评论数据
router.get('/detail/comment', async (req, res) => {

    let cat_id = req.query.cat_id
    let result = await Comment.find({ CatId: cat_id }).populate([
        { path: "commenter" },
        {
            // 这里是bug明天在修复
            path: "replies",
            populate: {
                path: "replier",
                model: "User",
            },
        },
    ])


    return res.status(200).json({
        code: 200,
        message: "数据返回成功",
        result: {
            message: "数据返回成功",
            data: result,
        }
    })
})


// 点赞请求
router.post('/detail/addup', async (req, res) => {
    try {
        // 一个是评论id一个是用户id
        let { addupId, commenter } = req.body
        // 基于评论的id进行查找到评论的数据数据
        // 然后在里面点赞的模块中看看是否有已经点赞的
        let result = await Comment.findById({ _id: addupId })


        // 查找并遍历所有的数据
        if (result != null) {
            const userIds = result.addup.map(user => String(user._id)); // 将 ObjectId 转换为字符串

            let index = userIds.findIndex(item => item == commenter)
            // 小于0表示就是数据表示没有数据，
            if (index < 0) {
                // 所以就是需要添加进去的
                result.addup.push(commenter)
            } else {
                // 删除原有掉元素
                result.addup.splice(index, 1)
            }

            await result.save()
        }



        return res.status(200).json({
            code: 200,
            message: "数据返回成功",
            result: {
                message: "数据返回成功",
                data: result,
            }
        })
    } catch (err) {
        return res.status(400).json({
            code: 400,
            message: "点赞失败",
            result: {
                message: "点赞失败",
                data: result,
            }
        })
    }






})


// 储存用户的回复的信息
router.post('/detail/reply', async (req, res) => {
    // 分别是回复的内容 回复的评论id  回复的用户id
    let { CommenTvalue, replyVal, commenter } = req.body


    let Replay = new Reply({
        content: CommenTvalue,
        replier: commenter,
        parentId: replyVal
    })
    // 持久化存储用户的回复
    let ss = await Replay.save()

    // 通过评论id查找到评论的id
    let sss = await Comment.findById(replyVal)


    // 将回复的id添加到查询出来的数据里面
    sss.replies.push(ss._id)

    // 到这里是将回复的id保存到评论id中
    await sss.save()



    // 这里查询出被添加到的回复信息和用户信息
    let replayDat = await Reply.findById(ss._id).populate("replier")

    return res.status(200).json({
        code: 200,
        message: "数据返回成功",
        result: {
            message: "数据返回成功",
            data: replayDat,
        }
    })
})




// 通过评价的id获取用户的评价详情
router.get('/detail/commentdetail', async (req, res) => {

    try {
        // console.log();
        let id = req.query.id

        // 查询出当前的数据、
        let commitData = await Comment.findById(id).populate([
            { path: "commenter" },
            {
                path: "replies",
                populate: {
                    path: "replier",
                    model: "User",
                }
            }
        ])

        if (!commitData) {
            return res.status(400).json({
                code: 400,
                message: "数据返回失败请重试",
                result: {
                    message: "数据返回失败请重试",
                    data: null,
                }
            })
        }

        return res.status(200).json({
            code: 200,
            message: "数据返回成功",
            result: {
                message: "数据返回成功",
                data: commitData,
            }
        })





    } catch (err) {
        return res.status(400).json({
            code: 400,
            message: "数据返回失败请重试",
            result: {
                message: "数据返回失败请重试",
                data: null,
            }
        })
    }




})







module.exports = router