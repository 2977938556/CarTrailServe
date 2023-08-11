const mongoose = require('mongoose');


// 广告轮播图字段
let AdvertisementSchema = new mongoose.Schema({
    imageUrl: { type: String, require: true },// 图片
    title: { type: String, require: true },// 标题
    weight: { type: Number, require: true },// 权重 1-5
    to_id: { type: String, require: true },// 需要跳转的id
    column: { type: String, require: true },// 所属栏目
    pagepath: { type: String, require: true },// 页面路径
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },// 关联到User数据集合的自动生成的id
    clickCount: { type: Number, default: 0 },// 帖子的点击量
    to_examine: {
        type: String,
        enum: ['pass', 'nopass'],
        default: 'pass'
    },
    // pass 在线 nopass 表示下线
    created_at: { type: Date, default: Date.now },// 创建时间
    updated_at: { type: Date, default: Date.now },// 更新时间
})


const AdverTisement = mongoose.model('AdverTisement', AdvertisementSchema);






// 通知模块
let NoticeSchema = new mongoose.Schema({
    title: { type: String, require: true },// 标题
    column: { type: String, require: true },// 所属栏目
    pagepath: { type: String, require: true },// 页面路径
    to_id: { type: String, require: true },// 需要跳转的id
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },// 关联到User数据集合的自动生成的id
    clickCount: { type: Number, default: 0 },// 帖子的点击量
    to_examine: {
        type: String,
        enum: ['pass', 'nopass'],
        default: 'pass'
    },
    created_at: { type: Date, default: Date.now },// 创建时间
    updated_at: { type: Date, default: Date.now },// 更新时间
})


const Notice = mongoose.model('Notice', NoticeSchema);








module.exports = { AdverTisement, Notice };


