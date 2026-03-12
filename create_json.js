const fs = require('fs');
const path = require('path');

const config = {
  imgDir: './zipImage',
  outputFile: './image-list.json',
  getTitle: (date) => `呆呆的成长记录 · ${date}`,
  getDesc: (date) => `这是毛毛在${date}的珍贵瞬间，记录每一个可爱的时刻～`,
  allowExts: ['.jpg', '.jpeg', '.png', '.webp']
};

// 解析图片名：提取完整日期+年月
function parseImgName(filename) {
  const reg = /IMG_(\d{4})(\d{2})(\d{2})_\d{6}\.(jpg|jpeg|png|webp)/i;
  const match = filename.match(reg);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = `${year}.${month}.${day}`; // 完整年月日
  const yearMonth = `${year}.${month}`;   // 仅年月（用于导航合并）

  return {
    date,
    yearMonth,
    filename,
    ext: `.${match[4]}`,
    alt: `呆呆 ${date}`
  };
}

// 生成JSON主函数
async function generateImageList() {
  try {
    if (!fs.existsSync(config.imgDir)) {
      throw new Error(`未找到图片文件夹：${config.imgDir}`);
    }

    const files = fs.readdirSync(config.imgDir);
    if (files.length === 0) {
      throw new Error(`${config.imgDir}文件夹为空`);
    }

    const imageList = [];
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!config.allowExts.includes(ext)) continue;

      const imgInfo = parseImgName(file);
      if (!imgInfo) {
        console.warn(`跳过不符合命名规则的文件：${file}`);
        continue;
      }

      imageList.push({
        date: imgInfo.date,        // 完整年月日（卡片显示）
        yearMonth: imgInfo.yearMonth, // 年月（导航合并）
        title: config.getTitle(imgInfo.date),
        desc: config.getDesc(imgInfo.date),
        img: `${config.imgDir}/${file}`,
        alt: imgInfo.alt
      });
    }

    // 按日期排序（旧→新）
    imageList.sort((a, b) => {
      const dateA = new Date(a.date.replace(/\./g, '-'));
      const dateB = new Date(b.date.replace(/\./g, '-'));
      return dateA - dateB;
    });

    fs.writeFileSync(config.outputFile, JSON.stringify(imageList, null, 2), 'utf8');
    console.log(`✅ 生成成功！共解析${imageList.length}张图片，文件路径：${config.outputFile}`);

  } catch (error) {
    console.error(`❌ 生成失败：${error.message}`);
  }
}

generateImageList();