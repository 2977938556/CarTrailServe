const mongoose = require('mongoose');

// 收藏模块
const CollectSchems = new mongoose.Schema({
    collect_id: { type: String, require: true },//这个是使用uuid进行自动创建的
    user_id: { type: String, require: true },// 关联到User数据集合的自动生成的id
    bookmarks: [
        {
            cat_id: { type: mongoose.Types.ObjectId, ref: "CatSchem" },
            created_at: { type: Date, default: Date.now },// 收藏时间
        }
    ]
})

const Collect = mongoose.model('CollectSchems', CollectSchems);

module.exports = Collect;

