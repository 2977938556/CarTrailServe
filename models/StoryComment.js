const mongoose = require('mongoose');
// 定义回复模型
const StoryReplySchema = new mongoose.Schema({
    content: { type: String, required: true, },// 回复的内容
    createTime: { type: Date, default: Date.now, }, // 回复时间
    replier: { type: mongoose.Types.ObjectId, ref: "User", required: true }, // 回复者信息
    parentId: { type: mongoose.Types.ObjectId, ref: "StoryComment", required: true, },// 回复所在评论的id
}, {
    // 定义创建时间和更新时间的自动记录方式
    // 将数据库中的createdAt字段映射到createTime属性上
    // 不需要自动记录更新时间
    timestamps: { createdAt: "createTime", updatedAt: false, },
}

);
// 创建Reply数据模型
const StoryReply = mongoose.model("StoryReply", StoryReplySchema);



// 这个是评论模块
const StoryCommentSchem = new mongoose.Schema({
    StoryId: { type: mongoose.Types.ObjectId, ref: "Story", required: true, },    // 评论所在帖子的id
    content: { type: String, required: true, },  // 评论内容
    createTime: { type: Date, default: Date.now, },  // 评论时间
    commenter: { type: mongoose.Types.ObjectId, ref: "User", required: true, }, // 评论者的信息
    replies: [{ type: mongoose.Types.ObjectId, ref: "StoryReply", }],  // 该评论下的回复列表
    replyCount: { type: Number, default: 0 }, // 添加replyCount字段
    addup: [{ type: mongoose.Types.ObjectId, ref: "User", }],  // 点赞的列表
},
    {
        // 定义创建时间和更新时间的自动记录方式
        // 不需要自动记录更新时间
        // 将数据库中的createdAt字段映射到createTime属性上
        timestamps: { createdAt: "createTime", updatedAt: false, },
    })


// 使用虚拟属性计算replyCount
StoryCommentSchem.virtual('commentRepliesCount').get(function () {
    return this.replies.length;
});

// 添加pre middleware，在保存Comment实例前计算并更新replyCount
StoryCommentSchem.pre('save', function (next) {
    this.replyCount = this.replies.length;
    next();
});

const StoryComment = mongoose.model('StoryComment', StoryCommentSchem);






module.exports = { StoryComment, StoryReply };

