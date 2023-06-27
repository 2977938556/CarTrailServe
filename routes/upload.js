const express = require('express');
const router = express.Router();
const User = require('../models/User.js')
const { v1 } = require('uuid')
const path = require('path')
const fs = require('fs');
const { GetIp } = require('../utils/https.js')
const qiniu = require('qiniu');




router.post('/upload/img', async (req, res) => {
    // 获取传递过来的base64Url
    let imgBase64 = req.body.base64

    const base64Data = imgBase64.replace(/^data:image\/\w+;base64,/, '');// 这个是只截取base64后面的内容部分
    const buffer = Buffer.from(base64Data, 'base64');// 这个转换成bufer流

    // 第三步：配置七牛云密钥和存储区域
    const accessKey = 'PS0cYPFZ5iCPBXDFD5CTQSUtdarhKgfnkaQrmP0v';
    const secretKey = 'QcvYXO5mH743vhaVeiQHaW3XBRMjx2SEX_QQri-W';
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    console.log(mac);
    const options = {
        scope: 'abcdefg',
    };
    const config = new qiniu.conf.Config();
    config.zone = qiniu.zone.Zone_z0; // 选择存储区域，例如华南
    let imageUrl = '';


    function uploadImageToQiniu(imagePath, imageName) {
        const putPolicy = new qiniu.rs.PutPolicy(options);
        const uploadToken = putPolicy.uploadToken(mac);

        // const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });

        const formUploader = new qiniu.form_up.FormUploader(config);
        const putExtra = new qiniu.form_up.PutExtra();

        formUploader.put(uploadToken, imageName, imagePath, putExtra, function (respErr, respBody, respInfo) {
            if (respErr) {
                throw respErr;
            }
            if (respInfo.statusCode === 200) {
                console.log('文件上传成功:');
                imageUrl = `http://rvh1hascg.hd-bkt.clouddn.com/${respBody.key}`;
                console.log(imageUrl);

            } else {
                console.log('文件上传失败:');
            }
        });
    }

    uploadImageToQiniu(buffer, `${v1()}.jpg`);
})








module.exports = router




// 为了将图片以Base64编码上传到七牛云，你需要按照以下步骤操作。

// 首先，确保你已经安装了Node.js和npm（Node.js包管理器）。

// 第一步：安装七牛云SDK

// 运行以下命令以安装七牛云的Node.js SDK。

// ```bash
// npm install qiniu
// ```

// 第二步：创建一个JS文件并导入依赖项

// 创建一个名为`uploadToQiniu.js`的文件，然后在文件中导入所需的依赖项。

// ```javascript
// const qiniu = require('qiniu');
// const fs = require('fs');
// const path = require('path');
// ```

// 第三步：配置七牛云密钥和存储区域

// 在`uploadToQiniu.js`文件中，使用你的七牛云密钥和存储区域配置SDK。

// ```javascript
// const accessKey = 'your-access-key';
// const secretKey = 'your-secret-key';
// const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

// const options = {
//   scope: 'your-bucket-name',
// };
// const config = new qiniu.conf.Config();
// config.zone = qiniu.zone.Zone_z2; // 选择存储区域，例如华南
// ```

// 第四步：编写上传图片的函数

// 接下来，我们将编写一个函数，该函数将读取图片文件，将其转换为Base64编码，然后将其上传到七牛云。

// ```javascript
// function uploadImageToQiniu(imagePath, imageName) {
//   const putPolicy = new qiniu.rs.PutPolicy(options);
//   const uploadToken = putPolicy.uploadToken(mac);

//   const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });

//   const formUploader = new qiniu.form_up.FormUploader(config);
//   const putExtra = new qiniu.form_up.PutExtra();

//   formUploader.put(uploadToken, imageName, base64Image, putExtra, function (respErr, respBody, respInfo) {
//     if (respErr) {
//       throw respErr;
//     }
//     if (respInfo.statusCode === 200) {
//       console.log('文件上传成功:', respBody);
//     } else {
//       console.log('文件上传失败:', respInfo.statusCode);
//       console.log(respBody);
//     }
//   });
// }
// ```

// 第五步：调用上传图片的函数

// 最后，调用上面定义的`uploadImageToQiniu`函数，传入图片路径和图片名称（在七牛云中存储的名称）。

// ```javascript
// const imagePath = path.join(__dirname, 'your-image-name.jpg');
// const imageName = 'uploaded-image-name.jpg';

// uploadImageToQiniu(imagePath, imageName);
// ```

// 将上面的代码保存到`uploadToQiniu.js`文件，然后使用`node uploadToQiniu.js`命令运行文件。成功上传后，你应该可以在七牛云的控制面板中看到新上传的图片。