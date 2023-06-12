const express = require('express');
const router = express.Router();
const User = require('../models/User.js')
const { v1 } = require('uuid')
const path = require('path')
const fs = require('fs');
const { GetIp } = require('../utils/https.js')



// 定义一个 保存的位置


// 这个是修改函数
async function PushImg(imgBase64, types) {
    let savePath = path.join(__dirname, `../public/uploads/userimg`);// 当前储存的地址
    let imgType = types.substring(types.lastIndexOf(".") + 1);// 图片的后缀名
    const randomChars = `${Math.random().toString(36).substring(2, 10)}${new Date().getTime()}.${types}`// 生成一个图片名称
    let imgUrl = path.join(savePath, randomChars);// 这个是获取用户的后缀名名称

    const base64Data = imgBase64.replace(/^data:image\/\w+;base64,/, '');// 这个是只截取base64后面的内容部分
    const buffer = Buffer.from(base64Data, 'base64');// 这个转换成bufer流

    return new Promise((resolve, reject) => {
        fs.writeFile(imgUrl, buffer, async (err) => {
            if (err) {
                reject(err)
            } else {
                // 这里返回
                let imgUrl = `http://${await GetIp()}:3000/public/uploads/userimg/${randomChars}`
                resolve({
                    imgUrl: imgUrl,//图片的服务器地址
                    savePath: savePath,// 图片的需要删除地址
                })
            }
        })
    })
}







// 这里有bug下午进行处理
router.post('/user/modifyusers', async (req, res) => {

    try {
        let { username, slogin, imgBase64, imgtype } = req.body.SubmitData

        // 这里可以将数据库中的数据给判断是否需要修改这里通过查询用户的id进行找到用户的id
        const userDat = await User.findOne({ user_id: req.user.username })



        // 这里我们需要判断是否有相同名称的用户
        const user_flage = await User.findOne({ username: username })



        // 这里是是需要进行判断是否有相同名称的

        // 这里是查询到自己了
        // 这里是判断是否有相同名称的用户
        // if (user_flage != null && user_flage.user_id != req.user.username) {
        //     return res.status(400).json({
        //         code: 400,
        //         message: "用户名称被使用",
        //         result: {
        //             message: "用户名称被使用",
        //             data: null
        //         }
        //     })
        // }




        // 这里就是说如果用户找到了那么就是找到了其他的用户有当前名称所以不能修改
        if (user_flage != null && user_flage?.user_id != req.user.username) {
            return res.status(400).json({
                code: 400,
                message: "用户名称被使用",
                result: {
                    message: "用户名称被使用",
                    data: null
                }
            })
        }




        if (user_flage == null) {
            userDat.username = username || userDat.username
            userDat.slogin = slogin || userDat.slogin
            await userDat.save()
        }








        // 这是判断是否是需要修改图片
        // 假设用户上传了一张新的头像那么用户
        if (imgBase64 != null) {
            const filename = userDat.bgimgUrl.split('/').pop();// 这里我们截取出用户的数据
            let { imgUrl, savePath } = await PushImg(imgBase64, imgtype)

            // 这里就是需要判断是否需要进行删除掉旧的头像
            if (userDat.bgimgUrl != "https://img.js.design/assets/img/6437f726bacae957a1524acb.png") {
                if (fs.existsSync(`${savePath}\\${filename}`)) {
                    fs.unlink(`${savePath}\\${filename}`, (err, data) => {
                        if (err) throw err;
                    });
                }
            }

            userDat.bgimgUrl = imgUrl

        }


        // 这里返回用户成功修改后的数据
        return res.status(200).json({
            code: 200,
            message: "修改成功",
            result: {
                message: "修改成功",
                data: userDat
            },
        });


    } catch (err) {
        return res.status(400).json({
            code: 400,
            message: "修改失败",
            result: {
                message: "修改失败",
                data: null
            },
        });
    }





})


module.exports = router