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
let { History } = require('../models/CatHistory.js')
const { Follow } = require('../models/FollowUser.js')
const { ImgUpdate } = require('../utils/ImgUpdate.js')




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
        let { FormDataList, inputData } = req.body

        const userDat = await User.findOne({ user_id: req.user.username })


        let imgList = null

        // 这里判断是否需要修改头像
        if (FormDataList[0].size > 0) {
            imgList = await ImgUpdate(FormDataList)
            userDat.bgimgUrl = imgList[0]
            if (userDat.bgimgUrl == "") {
                userDat.bgimgUrl = 'https://img.js.design/assets/img/64d19e663e75e479d103acbd.png#475edcba57aa3cb347f79daffb2165e4'
            }
        }

        // 这里需要进行判断是否有相同的用户名称
        const user_flage = await User.findOne({ username: inputData.username })


        // 这里是需要修啊给
        if (user_flage == null || userDat.username == user_flage.username) {
            userDat.username = inputData.username || userDat.username
            userDat.slogin = inputData.slogin || userDat.slogin
            await userDat.save()

        } else {
            return res.status(400).json({
                code: 400,
                message: "用户名称被使用",
                result: {
                    message: "用户名称被使用",
                    data: null
                }
            })
        }



        let s = await userDat.save()


        // 这里返回用户成功修改后的数据
        await delay(1000)
        return res.status(200).json({
            code: 200,
            message: "修改成功",
            result: {
                message: "修改成功",
                data: s
            },
        });


    } catch (err) {
        console.log(err);
        res.status(400).json({
            code: 400,
            message: err.message || "修改失败",
            result: {
                message: err.message || "修改失败",
            },
        })
    }





})


// 获取用户数据模块
router.get('/user/userData', async (req, res) => {
    try {
        let { _id = "" } = req.query


        if (_id == "") {
            throw new Error('获取数据失败')
        }

        let data = await User.findById(_id)


        if (!data) {
            throw new Error('用户不存在');
        }


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

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            code: 400,
            message: error.message || "获取失败",
            result: {
                message: error.message || "获取失败",
                data: null
            },
        });
    }


})


// 获取 发布【未领养，领养】 收藏 领养模块的数据
router.post('/user/catdata', async (req, res) => {
    try {
        let { types = "MyPublishing", state = 'noapply', _id = "", customertype = 0, option = { page: 1, pageSize: 3, store: -1 }
        } = req.body


        if (types === "" || _id === "") {
            throw new Error('获取数据失败');
        }

        let UserList = await User.findById(_id)


        if (!UserList) {
            throw new Error('用户不存在');
        }






        // 这里基于类型获取不同的数据
        // 用户 cat的数据 我的收藏 我的领养 搜索的数据(用户，流浪猫) 我发布的 

        //  types：类型  state：用于判断需要哪些数据  customertype  可选参数 0表示对内 1表示对内 _id:当前用户或者其他用户
        //  
        //  MyPublishing  我的发布 state = noapply(未领养) 默认 yesapply(已领养)
        //  MyCollection  我的收藏 
        //  Myadoption    我的领养 
        //  searchfor     搜索内容 state = cat(猫帖子) 默认 user(用户)
        //  MyHistory     历史记录  

        let data = null

        // 对内
        if (customertype == 0) {

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
                    data = await Cat.find({
                        user_id: _id,
                        to_examine: { $in: ["ok"] },
                        Successful_adoption: true,
                    }) || []
                }
            }

            // 我的收藏模块MyCollection
            if (types === "MyCollection") {
                data = await Collect.findOne({ user_id: _id }).populate('user_id').populate('bookmarks.cat_id')
            }

            // 获取用户成功领养的模块Myadoption
            if (types === "Myadoption") {
                data = await ApplyFor.find({ user_id: _id }).populate('user_id').populate('fuser_id').populate('cat_id') || []
            }

            // 这里我们设置一些参数

            // 获取用户历史记录
            if (types === "MyHistory") {
                page = option.page || 1
                pageSize = option.pageSize || 3
                store = option.store

                let his = await History.findOne({ user_id: _id })

                if (his == null) {
                    throw new Error("暂时没有历史记录哦")
                }


                let { histories } = await History.findOne({ user_id: _id }).populate('histories.cat_id')
                    .select("-user_id -_id histories") // 只选择 histories 字段
                    .slice("histories", [(page - 1) * pageSize, pageSize]).lean().exec() // 对 histories 数组进行分页查询

                data = histories
            }
        }

        // 对外
        if (customertype == 1) {
            // ta的发布模块
            if (types === 'MyPublishing') {
                // 我的发布 未领养
                data = await Cat.find({
                    user_id: _id,
                    to_examine: { $in: ["pass"] },
                    Successful_adoption: false,
                }) || []
            }



            // ta的收藏模块MyCollection
            if (types === "MyCollection") {
                data = await Collect.findOne({ user_id: _id }).populate('user_id').populate('bookmarks.cat_id')
            }


            // 获取用户成功领养的模块Myadoption
            if (types === "Myadoption") {
                data = await ApplyFor.find({ user_id: _id }).populate('user_id').populate('fuser_id').populate('cat_id') || []
            }
        }



        // if (data == null) {
        //     throw new Error('没有数据哦');
        // }



        await delay(100)
        return res.status(200).json({
            code: 200,
            message: "获取成功",
            result: {
                message: "获取成功",
                data: data
            },
        });


    } catch (err) {
        console.log(err);
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


// 清空历史记录
router.post('/user/deletehistory', async (req, res) => {

    try {
        let { _id } = req.body


        if (_id == "") {
            throw new Error("删除失败")
        }

        let his = await History.findOne({ user_id: _id })
        let deletedData = null
        if (his != null) {
            deletedData = await History.findOneAndDelete({ user_id: _id });
        } else {
            throw new Error("暂时没有历史记录哦")
        }

        return res.status(200).json({
            code: 200,
            message: "清空成功",
            result: {
                message: "清空成功",
                data: deletedData
            },
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            code: 400,
            message: error.message || "删除失败",
            result: {
                message: error.message || "删除失败",
                data: null
            },
        });
    }







})


// 隐私设置
router.post('/user/setprivacy', async (req, res) => {
    try {

        // 分别是 用户id 需要修改的隐私 需要修改的值
        let { _id, name, value } = req.body

        if (_id == "") {
            throw new Error("设置失败")
        }

        let userdata = await User.findById(_id)

        // 这里是修改数据
        userdata.configuration_information[name] = !value

        let data = await userdata.save()


        return res.status(200).json({
            code: 200,
            message: "设置成功",
            result: {
                message: "设置成功",
                data: data
            },
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            code: 400,
            message: error.message || "设置失败",
            result: {
                message: error.message || "设置失败",
                data: null
            },
        });
    }







})


// 获取关注总数
router.post('/user/gzmax', async (req, res) => {
    try {
        let { _id } = req.body
        const followerCount = await Follow.countDocuments({ 'follow.follow_id': _id });

        return res.status(200).json({
            code: 200,
            message: "清空成功",
            result: {
                message: "清空成功",
                data: followerCount
            },
        });

    } catch (err) {
        return res.status(400).json({
            code: 400,
            message: "获取失败",
            result: {
                message: "获取失败",
                data: null
            },
        });
    }





})




module.exports = router