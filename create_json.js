// 引入Node.js内置模块（无需额外安装）
const fs = require('fs');
const path = require('path');

// 配置项（可根据自己需求修改）
const config = {
  imgDir: './zipImage',        // 图片文件夹路径（根目录下的zipImage）
  outputFile: './image-list.json', // 生成的JSON文件路径
  // 自定义标题模板（可根据日期/文件名修改）
  getTitle: (date) => `呆呆的成长记录 · ${date}`,
  // 自定义描述模板（可根据需要修改）
  getDesc: (date) => `这是呆呆在${date}的珍贵瞬间，记录每一个可爱的时刻～`,
  // 支持的图片格式（可添加png/webp等）
  allowExts: ['.jpg', '.jpeg', '.png', '.webp']
};

// 核心：解析图片文件名（IMG_20250221_035748.jpg → 2025.02.21）
function parseImgName(filename) {
  // 正则匹配 IMG_年月日_时分秒.后缀
  const reg = /IMG_(\d{4})(\d{2})(\d{2})_\d{6}\.(jpg|jpeg|png|webp)/i;
  const match = filename.match(reg);
  
  if (!match) return null; // 不符合命名规则的图片跳过
  
  // 提取年/月/日，拼接成 2025.02.21 格式
  const [, year, month, day] = match;
  const date = `${year}.${month}.${day}`;
  
  return {
    date,
    filename,
    ext: `.${match[4]}`,
    alt: `呆呆 ${date}` // 图片alt属性
  };
}

// 生成JSON文件的主函数
function generateImageList() {
  try {
    // 1. 检查zipImage文件夹是否存在
    if (!fs.existsSync(config.imgDir)) {
      throw new Error(`未找到图片文件夹：${config.imgDir}，请确认路径正确`);
    }

    // 2. 读取zipImage文件夹里的所有文件
    const files = fs.readdirSync(config.imgDir);
    if (files.length === 0) {
      throw new Error(`${config.imgDir}文件夹为空，请放入图片后再运行`);
    }

    // 3. 筛选并解析符合命名规则的图片
    const imageList = [];
    files.forEach(file => {
      // 过滤文件格式
      const ext = path.extname(file).toLowerCase();
      if (!config.allowExts.includes(ext)) return;

      // 解析文件名
      const imgInfo = parseImgName(file);
      if (!imgInfo) {
        console.warn(`跳过不符合命名规则的文件：${file}`);
        return;
      }

      // 组装JSON数据（和网页解析的格式一致）
      imageList.push({
        date: imgInfo.date,
        title: config.getTitle(imgInfo.date),
        desc: config.getDesc(imgInfo.date),
        img: `${config.imgDir}/${file}`, // 图片路径
        alt: imgInfo.alt
      });
    });

    // 4. 按日期排序（旧→新）
    imageList.sort((a, b) => {
      const dateA = new Date(a.date.replace(/\./g, '-'));
      const dateB = new Date(b.date.replace(/\./g, '-'));
      return dateA - dateB;
    });

    // 5. 写入image-list.json文件
    fs.writeFileSync(
      config.outputFile,
      JSON.stringify(imageList, null, 2), // 格式化输出，方便查看
      'utf8'
    );

    console.log(`✅ 生成成功！`);
    console.log(`📁 生成文件：${config.outputFile}`);
    console.log(`🖼️  解析到符合规则的图片数量：${imageList.length}张`);
    if (imageList.length === 0) {
      console.log(`⚠️  提示：未找到符合 IMG_年月日_时分秒.jpg 命名规则的图片`);
    }

  } catch (error) {
    console.error(`❌ 生成失败：${error.message}`);
  }
}

// 执行主函数
generateImageList();