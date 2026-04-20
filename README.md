# Koa Server CLI

> 🚀 基于 Koa 3 + Sequelize + Redis 的企业级后端脚手架，开箱即用的 RESTful API 服务框架

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D16.0-green.svg)](https://nodejs.org/)
[![Koa](https://img.shields.io/badge/koa-3.x-brightgreen.svg)](https://koajs.com/)
[![Sequelize](https://img.shields.io/badge/sequelize-6.x-blue.svg)](https://sequelize.org/)

---

## ✨ 特性

- 🎯 **自动路由注册** - 扫描 controllers 目录，零配置自动生成路由
- 🔐 **完善的认证体系** - JWT + Redis Token 管理，支持图形验证码
- 🗄️ **ORM 数据层** - Sequelize 6 + MySQL，支持事务、关联查询
- 💾 **Redis 缓存** - ioredis 客户端，会话存储、验证码缓存
- 📝 **参数校验** - Joi schema 验证，统一的错误处理
- 🛡️ **安全防护** - Helmet、CORS、速率限制、请求压缩
- 📊 **日志系统** - Pino 高性能日志，支持开发/生产环境
- 🔄 **WebSocket** - 内置 WS 支持，实时通信能力
- 📦 **文件上传** - 本地存储 + OSS 支持
- 🎨 **代码规范** - Prettier 格式化，统一代码风格

---

## ⚠️ 重要说明

> **本项目中的业务逻辑（业主、房产、小区管理等）仅作为示例展示**，用于演示框架的使用方式。
>
> **实际使用时，请根据您的需求删除或替换这些示例代码。**
>
> **`sql/` 文件夹不是项目必备文件夹**，其中的 SQL 文件仅为参考展示使用，您可以根据实际需求设计自己的数据库表结构。

---

## 📦 快速开始

### 前置要求

- Node.js >= 16.0
- MySQL >= 5.7
- Redis >= 5.0

### 安装

```bash
# 克隆项目
git clone <your-repo-url>
cd koa-server

# 安装依赖
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env`（开发环境）或 `.env.production`（生产环境）：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 服务器配置
SERVER_PORT=3000
API_PREFIX=/api
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret

# MySQL 配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database
DB_USER=root
DB_PWD=your_password

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USER=default
REDIS_PWD=your_redis_password
REDIS_DB=0

# WebSocket 配置
WS_PATH=/ws
WS_PORT=3001
WS_AUTH_TOKEN=your-ws-token
```

### 初始化数据库

> **注意**：`sql/` 文件夹中的 SQL 文件仅为示例参考，实际项目中请根据您的业务需求设计数据库表结构。

如果需要运行示例代码，可以执行 `sql/` 目录下的 SQL 文件：

```bash
# 方式1: 使用 MySQL 命令行
mysql -u root -p your_database < sql/mysql.sql
mysql -u root -p your_database < sql/user.sql
mysql -u root -p your_database < sql/community.sql
mysql -u root -p your_database < sql/house.sql
mysql -u root -p your_database < sql/rel_owner_house.sql
mysql -u root -p your_database < sql/rel_owner_community.sql

# 方式2: 使用 Navicat/DBeaver 等工具导入
```

### 启动服务

```bash
# 开发环境（热重载）
npm run dev

# 生产环境
npm start
```

服务启动后访问：`http://localhost:3000`

---

## 📁 项目结构

```
koa-server/
├── sql/                      # 数据库脚本（仅供参考，非必需）
│   └── *.sql                # 示例表结构 SQL 文件
├── src/
│   ├── config/              # 配置管理
│   │   └── index.js         # 统一配置导出
│   ├── controllers/         # 控制器层（路由定义）
│   │   └── *.js             # 自动扫描注册的路由
│   ├── services/            # 业务逻辑层
│   │   └── *.js             # 业务逻辑实现
│   ├── model/               # 数据模型层
│   │   ├── models/          # Sequelize 模型定义
│   │   ├── relationships/   # 模型关联关系
│   │   └── index.js         # 模型导出
│   ├── guards/              # 路由守卫
│   │   └── auth.guard.js    # 身份认证守卫
│   ├── middleware/          # 中间件
│   │   └── upload.js        # 文件上传中间件
│   ├── router/              # 路由配置
│   │   └── index.js         # 自动路由注册
│   ├── redis/               # Redis 客户端
│   │   └── index.js         # Redis 连接管理
│   ├── ws/                  # WebSocket
│   │   └── *.js             # WS 服务相关文件
│   └── utils/               # 工具函数
│       ├── logger.js        # 日志工具
│       ├── jwt.js           # JWT 工具
│       ├── responseBody.js  # 响应体封装
│       ├── modelBuild.js    # 模型构建器（含 sequelize 实例）
│       └── *.js             # 其他工具函数
├── app.js                   # 应用入口
├── .env.example             # 环境变量示例文件
├── .env                     # 开发环境变量（需自行创建）
├── .env.production          # 生产环境变量（需自行创建）
├── package.json             # 依赖配置
└── README.md                # 项目文档
```

> **提示**：项目中的 `controllers/`、`services/`、`model/models/` 等目录下的示例代码仅供参考，实际使用时请根据业务需求进行替换或删除。

---

## 🎯 核心功能示例

> **以下接口仅为示例展示**，实际项目中请根据业务需求设计和实现自己的 API。

### 1. 用户认证系统示例

#### 注册
```bash
POST /api/login/register
Content-Type: application/json

{
  "phone": "13800138000",
  "password": "123456",
  "code": "ABCD",
  "token": "captcha-token-from-get-captcha"
}
```

#### 获取图形验证码
```bash
GET /api/login/captcha
```

#### 登录
```bash
POST /api/login/login
Content-Type: application/json

{
  "phone": "13800138000",
  "password": "123456"
}
```

#### 退出登录
```bash
POST /api/login/logout
Authorization: Bearer <token>
```

### 2. 房产认证流程示例

#### 获取可绑定房产列表
```bash
GET /api/auth/available-houses?ownerId=1
Authorization: Bearer <token>
```

#### 绑定房产（认证）
```bash
POST /api/auth/bind-house
Authorization: Bearer <token>
Content-Type: application/json

{
  "ownerId": 1,
  "houseId": 1
}
```

### 3. 业主管理示例

```bash
# 创建业主
POST /api/owner/create
Authorization: Bearer <token>

# 删除业主（软删除）
POST /api/owner/delete
Authorization: Bearer <token>

# 更新业主
POST /api/owner/update
Authorization: Bearer <token>

# 获取业主详情
GET /api/owner/detail?id=1

# 获取业主列表（分页+搜索）
GET /api/owner/list?page=1&pageSize=10&keyword=张三
```

### 4. 小区管理示例

```bash
# 创建小区
POST /api/community/create
Authorization: Bearer <token>

# 删除小区
POST /api/community/delete
Authorization: Bearer <token>

# 更新小区
POST /api/community/update
Authorization: Bearer <token>

# 获取小区详情
GET /api/community/detail?id=1

# 获取小区列表
GET /api/community/list?page=1&pageSize=10
```

### 5. 房产管理示例

```bash
# 创建房产
POST /api/house/create
Authorization: Bearer <token>

# 删除房产
POST /api/house/delete
Authorization: Bearer <token>

# 更新房产
POST /api/house/update
Authorization: Bearer <token>

# 获取房产详情
GET /api/house/detail?id=1

# 获取房产列表
GET /api/house/list?page=1&pageSize=10&communityId=1
```

### 6. 业主-房产关系管理示例

#### 业主视角
```bash
# 绑定房产
POST /api/owner-house/bind
Authorization: Bearer <token>

# 解绑房产
POST /api/owner-house/unbind
Authorization: Bearer <token>

# 设置主要房产
POST /api/owner-house/set-primary
Authorization: Bearer <token>

# 获取业主的房产列表
GET /api/owner-house/owner-houses?ownerId=1
```

#### 房产视角
```bash
# 添加产权人
POST /api/house-owner/add
Authorization: Bearer <token>

# 移除产权人
POST /api/house-owner/remove
Authorization: Bearer <token>

# 设置主要产权人
POST /api/house-owner/set-primary
Authorization: Bearer <token>

# 获取房产的产权人列表
GET /api/house-owner/list?houseId=1

# 批量添加产权人
POST /api/house-owner/batch-add
Authorization: Bearer <token>
```

---

## 🧹 清理示例代码（推荐）

开始自己的项目前，建议删除或替换以下示例文件：

```bash
# 删除示例 SQL 文件（可选）
rm -rf sql/*

# 删除示例控制器
rm src/controllers/owner.js
rm src/controllers/community.js
rm src/controllers/house.js
rm src/controllers/ownerHouse.js
rm src/controllers/houseOwner.js
rm src/controllers/login.js  # 如果需要保留认证功能，可以修改此文件

# 删除示例服务
rm src/services/owner.js
rm src/services/community.js
rm src/services/house.js
rm src/services/ownerHouse.js
rm src/services/houseOwner.js
rm src/services/login.js  # 如果需要保留认证功能，可以修改此文件

# 删除示例模型
rm src/model/models/owner.js
rm src/model/models/community.js
rm src/model/models/house.js
rm src/model/models/relOwnerHouse.js
rm src/model/models/relOwnerCommunity.js
```

然后根据您的业务需求创建新的控制器、服务和模型。

---

## 🔧 开发指南

### 添加新模块

#### 1. 创建数据库表

在 `sql/` 目录下创建 SQL 文件：

```sql
-- sql/example.sql
DROP TABLE IF EXISTS example;
CREATE TABLE `example` (
    `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `name` VARCHAR(100) NOT NULL COMMENT '名称',
    `is_delete` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否删除',
    `create_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '示例表';
```

#### 2. 创建 Sequelize 模型

在 `src/model/models/` 下创建模型文件：

```javascript
// src/model/models/example.js
const db = require('../../utils/modelBuild');
const { formatDate } = require('../../utils/index');

module.exports = {
  name: 'ExampleModel',
  data: db.defineModel(
    'example',
    {
      id: { type: db.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: db.STRING(100), allowNull: false },
      isDelete: { type: db.TINYINT(1), field: 'is_delete', defaultValue: 0 },
      createAt: {
        type: db.DATE,
        field: 'create_at',
        get() {
          return formatDate(this.getDataValue('createAt'));
        },
      },
      updateAt: {
        type: db.DATE,
        field: 'update_at',
        get() {
          return formatDate(this.getDataValue('updateAt'));
        },
      },
    },
    {
      underscored: false,
      timestamps: false,
      freezeTableName: true,
    }
  ),
};
```

在 `src/model/index.js` 中导出模型：

```javascript
const ExampleModel = require('./models/example').data;
module.exports = {
  // ...其他模型
  ExampleModel,
};
```

#### 3. 创建 Service 层

在 `src/services/` 下创建业务逻辑：

```javascript
// src/services/example.js
const { ExampleModel } = require('../model/index');
const { logger } = require('../utils/logger');
const { success, fail } = require('../utils/responseBody');

const createExample = async (params) => {
  const { name } = params;
  
  const example = await ExampleModel.create({ name });
  logger.info(`创建示例成功: ID=${example.id}`);
  
  return success(example, '创建成功');
};

const getExampleList = async (page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize;
  
  const { count, rows } = await ExampleModel.findAndCountAll({
    where: { isDelete: 0 },
    limit: pageSize,
    offset,
    order: [['createAt', 'DESC']],
  });
  
  return success({
    list: rows,
    total: count,
    page,
    pageSize,
  }, '获取成功');
};

module.exports = {
  createExample,
  getExampleList,
};
```

#### 4. 创建 Controller 层

在 `src/controllers/` 下创建路由配置：

```javascript
// src/controllers/example.js
const Joi = require('joi');
const ExampleService = require('../services/example');
const { logger } = require('../utils/logger');

const createExample = async (ctx) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      'any.required': '名称不能为空',
    }),
  });

  const { error, value } = schema.validate(ctx.request.body);
  if (error) {
    ctx.throw(400, error.details[0].message);
    return;
  }

  try {
    ctx.body = await ExampleService.createExample(value);
  } catch (err) {
    logger.error('创建示例失败:', err);
    ctx.throw(500, err.message);
  }
};

const getExampleList = async (ctx) => {
  const { page = 1, pageSize = 10 } = ctx.query;
  
  try {
    ctx.body = await ExampleService.getExampleList(page, pageSize);
  } catch (err) {
    logger.error('获取示例列表失败:', err);
    ctx.throw(500, err.message);
  }
};

module.exports = {
  '/example/create': {
    method: 'POST',
    handler: createExample,
    requiresAuth: true, // 需要登录
  },
  '/example/list': {
    method: 'GET',
    handler: getExampleList,
    requiresAuth: false, // 不需要登录
  },
};
```

**✅ 完成！** 路由会自动注册，无需手动配置。

---

### 路由配置说明

Controller 导出的对象格式：

```javascript
module.exports = {
  '/path/to/endpoint': {
    method: 'GET',           // HTTP 方法（GET/POST/PUT/DELETE/PATCH）
    handler: yourFunction,   // 处理函数
    requiresAuth: true,      // 是否需要登录（默认 true）
    permission: 'admin',     // 权限标识（可选）
    upload: true,            // 是否启用文件上传（可选）
  },
};
```

**支持的 HTTP 方法**：`GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`, `HEAD`

---

### 事务使用

涉及多表操作时，务必使用事务：

```javascript
const { sequelize } = require('../model/index');

const multiTableOperation = async (params) => {
  const transaction = await sequelize.transaction();
  
  try {
    // 所有数据库操作传入 transaction
    await Model1.create(..., { transaction });
    await Model2.update(..., { transaction });
    await Model3.destroy(..., { transaction });
    
    // 提交事务
    await transaction.commit();
    return success(null, '操作成功');
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    logger.error('操作失败:', error);
    throw error;
  }
};
```

---

## 🛠️ 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| **运行时** | Node.js | >= 16.0 |
| **Web 框架** | Koa | 3.x |
| **路由** | @koa/router | 15.x |
| **ORM** | Sequelize | 6.x |
| **数据库** | MySQL | >= 5.7 |
| **缓存** | Redis (ioredis) | 5.x |
| **认证** | JSON Web Token | 9.x |
| **密码加密** | bcryptjs | 3.x |
| **参数校验** | Joi | 18.x |
| **验证码** | svg-captcha | 1.x |
| **日志** | Pino | 10.x |
| **WebSocket** | ws | 8.x |
| **HTTP 客户端** | Axios | 1.x |
| **日期处理** | Day.js | 1.x |
| **安全** | Helmet | 9.x |
| **CORS** | @koa/cors | 5.x |
| **压缩** | koa-compress | 5.x |
| **限流** | koa-ratelimit | 6.x |
| **开发工具** | Nodemon | 3.x |
| **代码格式化** | Prettier | 3.x |

---

## 📝 代码规范

项目使用 Prettier 进行代码格式化，配置如下：

```json
{
  "printWidth": 120,
  "tabWidth": 2,
  "singleQuote": true,
  "semi": true,
  "trailingComma": "es5"
}
```

建议在编辑器中安装 Prettier 插件，并启用保存时自动格式化。

---

## 🔒 安全特性

- ✅ **Helmet** - 设置安全的 HTTP 头
- ✅ **CORS** - 跨域资源共享控制
- ✅ **JWT** - 无状态身份认证
- ✅ **Redis Token** - 服务端 Token 管理，支持强制下线
- ✅ **图形验证码** - 防止暴力破解
- ✅ **bcrypt** - 密码加盐哈希
- ✅ **速率限制** - 防止接口滥用
- ✅ **请求体大小限制** - 防止大文件攻击
- ✅ **SQL 注入防护** - Sequelize ORM 参数化查询

---

## 📊 日志系统

使用 Pino 高性能日志库，支持：

- **开发环境**：彩色输出，便于调试
- **生产环境**：JSON 格式，便于日志收集

日志级别：`fatal` > `error` > `warn` > `info` > `debug` > `trace`

```javascript
const { logger } = require('./src/utils/logger');

logger.info('普通信息');
logger.warn('警告信息');
logger.error('错误信息', error);
```

---

## 🌐 WebSocket 支持

内置 WebSocket 服务，用于实时通信：

```javascript
// 连接到 WebSocket
const ws = new WebSocket('ws://localhost:3001/ws?token=YOUR_TOKEN');

ws.on('open', () => {
  console.log('连接成功');
});

ws.on('message', (data) => {
  console.log('收到消息:', data);
});

ws.send(JSON.stringify({ type: 'chat', content: 'Hello' }));
```

---

## 🚀 部署

### 生产环境准备

1. **设置环境变量**

创建 `.env.production` 文件：

```env
NODE_ENV=production
SERVER_PORT=3000
DB_HOST=your-production-db-host
REDIS_HOST=your-production-redis-host
# ...其他配置
```

2. **安装 PM2（推荐）**

```bash
npm install -g pm2
```

3. **启动服务**

```bash
# 使用 PM2 启动
pm2 start app.js --name koa-server

# 查看状态
pm2 status

# 查看日志
pm2 logs koa-server

# 重启服务
pm2 restart koa-server

# 停止服务
pm2 stop koa-server
```

4. **Nginx 反向代理（可选）**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 👨‍💻 作者

LYS - [GitHub Profile](your-github-url)

---

## 🙏 致谢

感谢以下开源项目：

- [Koa](https://koajs.com/) - Web 框架
- [Sequelize](https://sequelize.org/) - ORM 工具
- [Redis](https://redis.io/) - 缓存数据库
- [Pino](https://getpino.io/) - 日志库

---

## 📮 联系方式

如有问题或建议，请通过以下方式联系：

- 📧 Email: lys505735364@163.com
- 💬 Issues: [GitHub Issues](your-repo-issues-url)

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**
