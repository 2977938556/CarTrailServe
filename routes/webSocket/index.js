// 导入保存在线用户数据的模块
let { Online, Frien, Message, BlackList } = require('../../models/WebSocket')
const mongoose = require('mongoose');

let userOnlones = {}

exports.UserSocket = function (io) {
    // 监听是否有人进来了
    io.on('connection', (socket) => {





        //01  这个是前端会自动发送信息过来[记录在线用户]
        socket.on('join', async (user_id = "") => {


            // 查询是否有当前的在线列表
            let userOnline = await Online.findOne({ user_id: user_id })

            // 这个是一个暂时显示在线列表
            userOnlones[user_id] = socket.id


            // 判断是否有当前在线列表 【这里是没有的状态】
            if (!userOnline) {
                // 这里保存在线之前需要看是否在线
                let s = await Online.create({
                    user_id: user_id,
                    device: socket.handshake.headers,
                    wsid: socket.id,
                    online: true,
                });

            } else {

                // 这里是有在线列表的情况
                // 分别更新设备信息&socketID信息和状态信息
                userOnline.device = socket.handshake.headers
                // 更新wsId
                userOnline.wsid = socket.id
                userOnline.online = true

                // 持久化保存
                let s = await userOnline.save()
            }





            // 这里登录后就会获取到消息列表
            let ssss = await Frien.find({ user_id: user_id })
                .populate({
                    path: 'user_id',
                    populate: {
                        path: 'user_id'
                    }
                })
                .populate({
                    path: 'fuser_id',
                    populate: {
                        path: 'user_id'
                    }
                })
                .populate({
                    path: 'message',
                    populate: {
                        path: 'user_id fuser_id'
                    }
                }).populate({
                    path: 'unread',
                    populate: {
                        path: 'user_id fuser_id'
                    }
                })


            // 这里返回消息列表
            socket.emit('welcome', ssss)

        })





        //02 这里是点击私聊按钮的时候【相当于添加好友】
        socket.on('frienMessage', async ({ user_id, friends }) => {


            // 这里查询当前是否有好友状态
            let chat = await Frien.findOne({
                $and: [
                    { user_id: user_id },
                    { fuser_id: friends }
                ]
            });


            // 没有的情况 就新建一个消息【此时这个好友状态还是单项的因为只有发送了第一条信息才算】
            if (chat == null) {
                await Frien.create({
                    user_id: user_id,
                    fuser_id: friends
                })

            }

            // 返回一个状态给前端进行跳转页面
            socket.emit('frienMessage_isok', { vavle: true, friends: friends });

            // let res = await BlackList.findOne({
            //     $and: [
            //         { user_id: friends },
            //         { black_user: user_id }
            //     ]
            // })

            // if (res != null) {
            //     socket.emit('blackList_data', { vavle: true, data: res });
            // }




        })


        // 这里是验证是否被拉黑了
        socket.on('blackMessage', async ({ user_id, fuser_id, flage }) => {
            console.log(user_id, fuser_id, flage);
            if (flage == "A") {
                console.log("A模块");
                let a = await BlackList.findOne({
                    $and: [
                        { user_id: fuser_id },
                        { black_user: user_id }
                    ]
                })

                let b = await BlackList.findOne({
                    $and: [
                        { user_id: user_id },
                        { black_user: fuser_id }
                    ]
                })

                if (a != null) {
                    console.log("1");
                    return socket.emit('black_detai', { messages: "你被对方拉黑了", data: a });
                } else if (b != null) {
                    console.log("2");
                    return socket.emit('black_detai', { messages: "你拉黑了该用户", data: b });
                } else {
                    console.log("3");
                    return socket.emit('black_detai', { messages: "可以聊天", data: null });
                }
            } else if (flage == "B") {
                console.log("B模块");

                let b = await BlackList.findOne({
                    $and: [
                        { user_id: user_id },
                        { black_user: fuser_id }
                    ]
                })
                if (b != null) {
                    console.log("1");
                    return socket.emit('black_detai', { messages: "你拉黑了对方", data: b });
                } else {
                    console.log("2");
                    return socket.emit('black_detai', { messages: "可以聊天", data: null });
                }

            }

        })



        //03 监听用户点击发送信息按钮的时候
        socket.on('pushMessage', async ({ message = "我是默认信息", user_id, fuser_id }) => {

            // 保存消息数据到数据库
            let messageData = await Message.create({
                user_id: user_id,
                fuser_id: fuser_id,
                neiron: message,
            })



            // 这里为什么需要查询是否接收方在线【因为后期我们需要socket.id 将数据单独发送】

            let userOnline = await Online.findOne({ user_id: fuser_id })
            // 这里是没有在线那么就创建一个并且 状态未false 之后如果登录了那么就会变成true
            if (userOnline == null) {
                // 这里保存在线之前需要看是否在线
                let s = await Online.create({
                    user_id: fuser_id,
                    device: socket.handshake.headers,
                    wsid: socket.id,
                    online: false,
                });
            }



            // 这里是重新查询是否在线
            let result = await Online.findOne({ user_id: fuser_id })




            // 这里我们查询出 接收方是否有对方的私聊信息
            let Fuser = await Frien.findOne({
                $and: [
                    { user_id: fuser_id },
                    { fuser_id: user_id }
                ]
            });

            // 如果没有的情况那么就会添加一个与对方的私聊信息
            if (Fuser == null) {
                let s = await Frien.create({
                    user_id: fuser_id,
                    fuser_id: user_id,
                })

                // 并且将聊天的 信息ID保存
                s.message.push(messageData._id)
                await s.save()

                // 这里是不在线的情况的时候会将信息id保存到未读的数组里
                // if (result.online == false) {
                s.unread.push(messageData._id)
                await s.save()
                // }
            } else {
                // 这里是已经有私聊信息【将消息id保存】
                Fuser.message.push(messageData._id)
                await Fuser.save()

                // 这里是不在线的情况的时候会将信息id保存到未读的数组里
                // if (result.online == false) {
                Fuser.unread.push(messageData._id)
                await Fuser.save()
                // }
            }




            // 这个是发送方的私聊信息
            let FuserA = await Frien.findOne({
                $and: [
                    { user_id: user_id },
                    { fuser_id: fuser_id }
                ]
            });


            // 这里将信息id保存
            FuserA.message.push(messageData._id)
            await FuserA.save()



            // 这里是返回数据
            let ssss = await Frien.find({ user_id: fuser_id })
                .populate({
                    path: 'user_id',
                    populate: {
                        path: 'user_id'
                    }
                })
                .populate({
                    path: 'fuser_id',
                    populate: {
                        path: 'user_id'
                    }
                })
                .populate({
                    path: 'message',
                    populate: {
                        path: 'user_id fuser_id'
                    }
                })

            // 这个是返回给接收方的列表数据
            socket.to(result.wsid).emit('welcome', ssss)



            let ssssB = await Frien.find({ user_id: user_id })
                .populate({
                    path: 'user_id',
                    populate: {
                        path: 'user_id'
                    }
                })
                .populate({
                    path: 'fuser_id',
                    populate: {
                        path: 'user_id'
                    }
                })
                .populate({
                    path: 'message',
                    populate: {
                        path: 'user_id fuser_id'
                    }
                })

            // 这个是返回给发送方的列表数据
            socket.emit('welcome', ssssB)




            // 将信息数据返回回去
            let rs = await Message.findById(messageData._id).populate('user_id').populate('fuser_id')
            socket.to(result.wsid).emit('getmessage_deatil_data_item', rs)
        })



        // 基于当前获取聊天数据
        socket.on('getmessage_detail', async ({ user_id, fuser_id }) => {

            // 获取当前私信的聊天数据
            let ssss = await Frien.findOne({
                $and: [
                    { user_id: user_id },
                    { fuser_id: fuser_id }
                ]
            })
                .populate({
                    path: 'user_id',
                    populate: {
                        path: 'user_id'
                    }
                })
                .populate({
                    path: 'fuser_id',
                    populate: {
                        path: 'user_id'
                    }
                })
                .populate({
                    path: 'message',
                    populate: {
                        path: 'user_id fuser_id'
                    }
                })

            // 查询对方的在线状态
            let result = await Online.findOne({ user_id: fuser_id }).populate('user_id')

            // 将信息推送给发送方
            socket.emit('getmessage_deatil_data', ssss)
            // 将信息推送给接收方
            socket.to(result.wsid).emit('getmessage_deatil_data', ssss)

        })



        // 清空当前的未读信息
        socket.on('delete_unread', async ({ user_id, fuser_id }) => {

            // 查询出当前用户
            let FuserA = await Frien.findOne({
                $and: [
                    { user_id: user_id },
                    { fuser_id: fuser_id }
                ]
            });
            // 如果有数据那么就清空
            if (FuserA != null) {
                FuserA.unread = []
                FuserA.save()

                let ssss = await Frien.find({ user_id: user_id })
                    .populate({
                        path: 'user_id',
                        populate: {
                            path: 'user_id'
                        }
                    })
                    .populate({
                        path: 'fuser_id',
                        populate: {
                            path: 'user_id'
                        }
                    })
                    .populate({
                        path: 'message',
                        populate: {
                            path: 'user_id fuser_id'
                        }
                    })

                // 返回数据列表
                socket.emit('welcome', ssss)

            }

        })


        // 监听用户离开
        socket.on('disconnect', async () => {
            let userOnline = await Online.findOne({ wsid: socket.id })
            if (userOnline) {
                userOnline.online = false
                await userOnline.save()
            }
            console.log('WebSocket 连接已断开');
        });



        // 点击拉黑菜单
        socket.on('black_user', async ({ user_id, fuser_id, flage }) => {
            try {
                let res = await BlackList.findOne({
                    $and: [
                        { user_id: user_id },
                        { black_user: fuser_id }
                    ]
                })

                // 这里是如果传递的是true 说明是拉黑的状态
                if (flage == true) {
                    // 并且没有那么就创建一个
                    if (res == null) {
                        await BlackList.create({
                            user_id: user_id,
                            black_user: fuser_id
                        })
                    }
                } else {
                    await BlackList.deleteOne({
                        $and: [
                            { user_id: user_id },
                            { black_user: fuser_id }
                        ]
                    })
                }

            } catch (error) {
                console.log('发生错误：', error);
            }


        })


    });



    // 这里我们需要存储用户的聊天数据
}


setInterval(() => {
    console.log(userOnlones);
}, 5000)