const mongoose = require('mongoose');

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


module.exports = History;

