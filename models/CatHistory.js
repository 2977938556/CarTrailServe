const mongoose = require('mongoose');



// 历史记录的模块
const HistorySchem = new mongoose.Schema({
    user_id: String, // 用户ID
    histories: [
        {
            type: {
                type: String,
                enum: ['SEARCH', 'SEARCH'] // 只能取 SEARCH 或 SEARCH 中的一个值
            }, // 记录类型，如搜索历史、浏览历史等
            cat_id: String, // 帖子的id
            updated_at: { type: Date, default: Date.now }// 浏览记录的创建时间
        }
    ]
})

const History = mongoose.model('HistorySchem', HistorySchem);



// 个人喜好数据
const LikeSchem = new mongoose.Schema({
    user_id: String,
    like: { type: Array, default: [] }
})
const Like = mongoose.model('LikeSchem', LikeSchem)










module.exports = { History, Like };

