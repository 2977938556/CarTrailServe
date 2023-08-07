const mongoose = require('mongoose');

const SeatchHistorySchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },// 关联到User数据集合的自动生成的id
    history: { type: String },
    created_at: { type: Date, default: Date.now },// 创建时间
})


const SeatchHistory = mongoose.model('SeatchHistory', SeatchHistorySchema);


module.exports = { SeatchHistory };

