const mongoose = require('mongoose');

const FollowUser = new mongoose.Schema({
    user_id: { type: mongoose.Types.ObjectId, ref: "User", required: true }, // 当前用户的id
    follow: [
        {
            follow_id: { type: mongoose.Types.ObjectId, ref: "User", required: true },// 当前用户关注的id
            create_time: Date, // 关注时间
            update_time: Date // 更新时间
        }

    ]
})


const Follow = mongoose.model('Follow', FollowUser);


module.exports = { Follow };
