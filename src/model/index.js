const fs = require('fs');
const { logger } = require('../utils/logger');

let files = fs.readdirSync(__dirname + '/models');

let js_files = files.filter((f) => {
  return f.endsWith('.js');
}, files);

const modelMap = {};
for (let f of js_files) {
  logger.warn(`读取数据模型构造文件 ${f}...`);
  let obj = require(__dirname + '/models/' + f);
  modelMap[obj.name] = obj.data;
}
module.exports = modelMap;
