const express = require('express');
const path = require('path')
const router = express.Router();
const { v1, v4 } = require('uuid')
const fs = require('fs');
const os = require('os');
const Cat = require('../models/Cat.js')// 数据表
const { delay } = require('../utils/UniversalFn.js')// 通用函数



// 延迟函数




// 获取当前服务器的ip地址，端口是固定的3000
function GetIp() {
    return new Promise((resolve, reject) => {
        const interfaces = os.networkInterfaces();
        let address = null;
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family !== 'IPv4' || iface.internal !== false) {
                    // 跳过它不是IPv4或内部接口的地址
                    continue;
                }
                // 找到匹配的 IP 地址
                address = iface.address;
                break;
            }
            if (address) {
                resolve(address)
                break;
            } else {
                reject(new Error("服务器错误请重试"))
            }
        }
    })
}

// 定义一个 保存的位置
let savePath = path.join(__dirname, `../upload/cart/`);

// 创建一个multer实例，设置上传文件的保存目录
router.post('/release/filte', async (req, res) => {
    try {
        // 分别是 文件数据，input数据，用户数据
        let { FormDataList, inputData, UserDat } = req.body
        // console.log(inputData, UserDat);
        // 大致步骤就是新建一个唯一的文件夹 
        const filename = `${Date.now()}-${parseInt(Math.random() * 100000)}${UserDat.created_at.slice(0, 4)}`;
        let savePath = path.join(__dirname, `../public/uploads/cart/${filename}`);
        // 这里使用await进行设置发布数据
        await fs.promises.mkdir(`${savePath}`)
        // // 开始循环
        // // 将图片循环存入 生成一个唯一的id 作为img图片名称
        // // 每次插入一张那么就需要保存到当前保存用户路径的位置
        // // 最后通过promise 获取路径结果
        let Urls = FormDataList.map(({ name, size, base64 }) => {
            // 文件格式名称
            let imgType = name.substring(name.lastIndexOf(".") + 1);
            // 拼接的一个图片文件名称
            const randomChars = `${Math.random().toString(36).substring(2, 10)}${new Date().getTime()}.${imgType}`
            let imgUrl = path.join(savePath, randomChars);

            // 去掉 base64 编码头部信息，只留下数据部分
            // 将 base64 编码的数据转换为二进制数据
            const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');

            // 使用promise封装一个
            return new Promise((reolve, reject) => {
                fs.writeFile(imgUrl, buffer, async (err) => {
                    if (err) {
                        return reject({ valve: false })
                    }
                    // 参数分别是
                    // 文件夹名称
                    // 图片的完整储存路径
                    // 服务器ip地址
                    // 判断是否成功
                    reolve({
                        folderName: filename,
                        saveUrl: imgUrl,
                        imgName: randomChars,
                        serve: await GetIp(),
                        valve: true
                    })
                });
            })
        })


        Promise.all(Urls).then(async (result) => {
            // 转换图片的数据
            let imgUrlList = result.map(({ folderName, saveUrl, imgName, serve, valve }) => {
                remImg = folderName
                return `http://${serve}:3000/public/uploads/cart/${folderName}/${imgName}`
            })


            // 设计然后加入用户id进行连表查询
            let cat = await Cat.create({
                cat_id: `${v4()}-${Math.random().toString(36).substring(2, 10)}`,// 帖子的id
                user_id: UserDat._id,// 关联到User数据集合的自动生成的id
                title: inputData.title,// 标题
                content: inputData.content,// 内容
                addrs: inputData.addrs || {},// 发布地区
                lable: inputData.lable || [],// 标签
                imageUrl: imgUrlList,// 图片数据存储的是图片地址
            })
            // 延迟函数
            // await delay(3000)


            // 存储成功返回数据给前端
            return res.status(201).json({
                code: 201,
                message: "上传成功",
                result: {
                    message: "上传成功",
                    cat: cat
                },
            });
        }).catch((err => {
            let imgUrl = path.join(__dirname, `/public/uploads/cart/${filename}`);
            fs.rm(imgUrl, { recursive: true }, (err) => {
                if (err) {
                    console.error("删除失败");
                } else {
                    console.log('文件夹删除成功！');
                }
            });
        }))
    } catch (err) {
        res.status(400).json({
            code: 400,
            message: "发布失败，请重试",
            result: {
                message: "发布失败，请重试",
            },
        })
    }

});



module.exports = router;
