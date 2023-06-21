const { Activity } = require('../models/Activit.js')


// 这个是活动是否过期的模块
async function checkActivityStatus() {
    // 查询数据库，获取所有报名中的活动
    const activities = await Activity.find({ to_examine: 'progress' });

    // 这里获取当前的时间转换成时间戳
    const now = new Date();
    const isoString = now.toISOString();
    const timestamp = Date.parse(isoString);

    // 这里判断是否有活动需要被
    if (activities.length != 0) {
        for (let i = 0; i < activities.length; i++) {
            let activitie = activities[i]
            if (Date.parse(activitie.time[1]) < timestamp) {
                // 若已到达截止时间，则将状态修改为结束
                activitie.to_examine = 'end';
                await activitie.save();
            }
        }
    }
}



setInterval(checkActivityStatus, 10000)
