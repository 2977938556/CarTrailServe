const mongoose = require('mongoose');

// 这个是当用户登录成功的时候
const CollectSchems = new mongoose.Schema({
    collect_id: { type: String, require: true },//这个是使用uuid进行自动创建的
    user_id: { type: String, require: true },// 关联到User数据集合的自动生成的id
    bookmarks: { type: Array, default: true },//存储数据的

})

const Collect = mongoose.model('CollectSchems', CollectSchems);

module.exports = Collect;

