let { StoryComment, StoryReply } = require('../models/StoryComment.js')



// 基于当前的id进行查询评论的数据
let GetCommentDetailData = async (_id, type) => {
    try {
        let modules = null
        // 这里是判断是哪个模块的
        if (type == "mjgs") {
            modules = StoryComment
        }
        let data = await modules.findById(_id).populate('commenter')

        // 这里我们判断是否有数据
        if (!data) {
            return Promise.reject("获取数据失败");
        } else {
            return Promise.resolve(data);
        }

    } catch (Err) {
        return Promise.reject("获取数据失败");
    }
}



// 返回当前评论详情的回复评论
// 基于分页数据进行查找
let GetCommentReplay = async ({ page = 1, pageSize = 5, parentId, type, sort = 1 }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let modules = null
            // 错误处理部分
            if (!parentId) {
                throw new Error("缺少 parentId 参数");
            }
            // 这里是判断是哪个模块的
            if (type == "mjgs") {
                modules = StoryReply
            }

            const skip = (page - 1) * pageSize; // 跳过的数据量

            const data = await modules.find({ parentId: parentId }).populate("replier").sort({ createTime: sort }).skip((skip)).limit(pageSize)

            if (!data) {
                return reject("没有当前评论")
            } else {
                return resolve(data)
            }


        } catch (err) {
            return reject("获取数据失败")
        }
    })
}


// 基于回复进行回复模块
let GetCommentHfreplay = async ({ content, commentId, user_id, type }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let modules = {
                a: null, // 子集
                b: null // 父级
            };
            // 错误处理部分
            if (!commentId) {
                throw new Error("缺少 commentId 参数");
            }
            // 这里是判断是哪个模块的
            if (type === "mjgs") {
                modules.a = StoryReply;
                modules.b = StoryComment;
            }

            // 将参数保存到回复模块
            let storyReplyDat = await modules.a.create({
                content: content,
                replier: user_id,
                parentId: commentId
            });

            // 查询出父级的评论
            let FlateData = await modules.b.findById(commentId);

            // 将回复的评论id添加进到父级
            FlateData.replies.unshift(storyReplyDat._id);

            // 持久化保存评论
            await FlateData.save();

            // 这里是需要查询出
            let data = await modules.a.findById(storyReplyDat._id).populate("replier");

            if (!data) {
                return reject("没有当前评论");
            } else {
                return resolve(data);
            }
        } catch (err) {
            console.log(err);
            return reject("获取数据失败");
        }
    });
}




// 设置点赞的模块
let GetPushStoreLink = async ({ userId, commentId, type }) => {
    return new Promise(async (resolve, reject) => {
        try {
            let modules = null;
            // 错误处理部分
            if (!commentId) {
                throw new Error("缺少 commentId 参数");
            }
            // 这里是判断是哪个模块的
            if (type === "mjgs") {
                modules = StoryComment;
            }

            // 查询出评论
            let result = await modules.findById(commentId)

            // 查询出里面是否有当前点击的用户
            let index = result.addup.findIndex(item => item.toString() === userId)

            // 如果没有点赞那么就添加
            if (index < 0) {
                // 所以就是需要添加进去的
                result.addup.push(userId)
            } else {
                // 删除原有掉元素
                result.addup.splice(index, 1)
            }

            await result.save()
            resolve(result)
        } catch (err) {
            return reject("获取数据失败");
        }
    });



}








module.exports = {
    GetCommentDetailData,// 获取主要评论
    GetCommentReplay,// 获取回复评论列表
    GetCommentHfreplay,// 添加回复
    GetPushStoreLink,// 设置点赞的模块
}
