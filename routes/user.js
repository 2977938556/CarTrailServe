const express = require('express');
const router = express.Router();
const User = require('../models/User.js')
const { v1 } = require('uuid')
const path = require('path')
const fs = require('fs');
const { GetIp } = require('../utils/https.js')
const { ApplyFor } = require('../models/Adopt.js')
const Cat = require('../models/Cat.js');
const { type } = require('os');
const Collect = require('../models/Collect.js')
const { delay } = require('../utils/UniversalFn.js')// 通用函数



// 定义一个 保存的位置


// 这个是修改函数
async function PushImg(imgBase64, types) {
    let savePath = path.join(__dirname, `../public/uploads/userimg`);// 当前储存的地址
    let imgType = types.substring(types.lastIndexOf(".") + 1);// 图片的后缀名
    const randomChars = `${Math.random().toString(36).substring(2, 10)}${new Date().getTime()}.${imgType}`// 生成一个图片名称
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


// 修改用户头像和名称[待修改]
router.post('/user/modifyusers', async (req, res) => {

    try {
        let { username, slogin, imgBase64, imgtype } = req.body.SubmitData

        // 这里可以将数据库中的数据给判断是否需要修改这里通过查询用户的id进行找到用户的id
        const userDat = await User.findOne({ user_id: req.user.username })


        // 这里我们需要判断是否有相同名称的用户
        const user_flage = await User.findOne({ username: username })



        // 这里是是需要进行判断是否有相同名称的
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


            console.log(imgUrl);

            userDat.bgimgUrl = imgUrl


            await userDat.save()

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
        console.log(err);
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


// 获取用户数据模块
router.get('/user/userData', async (req, res) => {
    try {
        let { _id } = req.query
        let data = await User.findById(_id)
        if (data !== null) {
            return res.status(200).json({
                code: 200,
                message: "获取数据成功",
                result: {
                    message: "获取数据成功",
                    data: data
                }
            })
        }
        return res.status(404).json({
            code: 404,
            message: "获取数据失败",
            result: {
                message: "获取数据失败",
                data: null
            }
        })
    } catch (err) {
        return res.status(404).json({
            code: 404,
            message: "服务器错误",
            result: {
                message: "服务器错误",
                data: null
            }
        })
    }


})



// 获取 发布【未领养，领养】 收藏 领养模块的数据
router.post('/user/catdata', async (req, res) => {
    try {
        let { types = "MyPublishing", state = 'noapply', _id = "", customertype = 0
        } = req.body

        console.log(types, state, _id, customertype);




        if (types === "" || _id === "") {
            throw new Error('获取数据失败');
        }

        // 这里基于类型获取不同的数据
        // 用户 cat的数据 我的收藏 我的领养 搜索的数据(用户，流浪猫) 我发布的 

        //  types：类型  state：用于判断需要哪些数据  customertype  可选参数 0表示对内 1表示对内 _id:当前用户或者其他用户
        //  
        //  MyPublishing  我的发布 state = noapply(未领养) 默认 yesapply(已领养)
        //  MyCollection  我的收藏 
        //  Myadoption    我的领养 
        //  searchfor     搜索内容 state = cat(猫帖子) 默认 user(用户)

        let data = null

        // 对内
        if (customertype == 0) {
            console.log("进来了1");
            // 我的发布模块数据 MyPublishing
            if (types === 'MyPublishing') {

                // 我的发布 未领养
                if (state == 'noapply') {
                    data = await Cat.find({
                        user_id: _id,
                        to_examine: { $in: ["pass"] },
                        Successful_adoption: false,
                    }) || []
                    // 已领养
                } else {
                    console.log("进来这里了04");
                    data = await Cat.find({
                        user_id: _id,
                        to_examine: { $in: ["ok"] },
                        Successful_adoption: true,
                    }) || []
                }
            }

            // 我的收藏模块MyCollection
            if (types === "MyCollection") {
                data = await Collect.findOne({ user_id: _id }).populate('user_id').populate('bookmarks.cat_id') || []
            }

            if (types === "Myadoption") {
                data = await ApplyFor.find({ user_id: _id }).populate('user_id').populate('fuser_id').populate('cat_id') || []
            }


        }

        // 对外
        // if (customertype == 1) {    

        // }



        // if (data == null) {
        //     throw new Error('没有数据哦');
        // }

        await delay(2000)
        return res.status(200).json({
            code: 200,
            message: "获取成功",
            result: {
                message: "获取成功",
                data: data
            },
        });


    } catch (err) {
        return res.status(400).json({
            code: 400,
            message: err.message || "获取数据错误",
            result: {
                message: err.message || "获取数据错误",
                data: null
            }
        })

    }












})



// 取消收藏【批量的取消】
router.post('/user/lovedelete', async (req, res) => {
    try {
        const { _id, deleteCatId = [] } = req.body;

        if (_id == "" || deleteCatId.length == 0) {
            throw new Error("删除失败")
        }

        // 查询用户的收藏数据
        const collectData = await Collect.findOne({ user_id: _id }).populate('bookmarks.cat_id');

        // 过滤出不需要删除的项
        const updatedBookmarks = collectData.bookmarks.filter(item => !deleteCatId.includes(String(item.cat_id._id)));

        // 更新收藏书签数组
        collectData.bookmarks = updatedBookmarks;

        // 保存更新后的数据到数据库
        await collectData.save();

        return res.status(200).json({
            code: 200,
            message: "获取成功",
            result: {
                message: "获取成功",
                data: updatedBookmarks
            },
        });

    } catch (error) {
        return res.status(400).json({
            code: 400,
            message: error.message || "删除失败",
            result: {
                message: error.message || "删除失败",
                data: null
            },
        });
    }
});








module.exports = router