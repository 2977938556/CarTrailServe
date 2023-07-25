// 需要传递数组进去
// 每一个数组需要又图片名称图片base64数据 还有图片大小
const qiniu = require('qiniu');



// 第三步：配置七牛云密钥和存储区域
const accessKey = 'PS0cYPFZ5iCPBXDFD5CTQSUtdarhKgfnkaQrmP0v';
const secretKey = 'QcvYXO5mH743vhaVeiQHaW3XBRMjx2SEX_QQri-W';
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

// 需要保存的空间
const options = {
    scope: 'abcdefg',
};

const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_z2; // 选择存储区域，例如华南


const putPolicy = new qiniu.rs.PutPolicy(options);
const uploadToken = putPolicy.uploadToken(mac);

const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();


// 有一个函数用于循环数组将所有的数据都变成转换成一个Buffer 使用promise进行
function ConVentImg(imgData) {
    return imgData.map(item => {
        return new Promise((resolve, reject) => {
            const base64Data = item.base64.replace(/^data:image\/\w+;base64,/, '');// 这个是只截取base64后面的内容部分
            const buffer = Buffer.from(base64Data, 'base64');// 这个转换成bufer流
            // 出力图片模块
            let imgType = item.name.substring(item.name.lastIndexOf(".") + 1);// 图片类型
            const imgName = `${Math.random().toString(36).substring(2, 10)}${new Date().getTime()}.${imgType}`// 生成一个图片名称

            if (!imgName || !buffer) {
                reject("图片上传失败了")
            } else {
                resolve({ buffer, imgName })
            }
        })
    })

}



exports.ImgUpdate = async (ImgDataArray) => {
    try {
        return new Promise(async (resolve, reject) => {
            // 获取已经转换过的数据
            let ImgData = await Promise.all(ConVentImg(ImgDataArray))

            // 这里是基于上面的数据进行七牛云的上传
            let s = ImgData.map(item => {
                return new Promise((resolve, reject) => {
                    formUploader.put(uploadToken, item.imgName, item.buffer, putExtra, function (respErr, respBody, respInfo) {
                        if (respErr) {
                            // reject(new Error("文件上传失败"))
                            reject("文件上传失败")
                        }
                        if (respInfo.statusCode === 200) {
                            console.log(respBody.key);
                            resolve(`http://rwyswjtk7.hn-bkt.clouddn.com/${respBody.key}`)
                        } else {
                            // reject(new Error("文件上传失败"))
                            reject("文件上传失败")
                        }
                    });
                })
            })
            resolve(await Promise.all(s))
        })
    } catch (err) {
        return Promise.reject("图片上传失败了")
    }
}