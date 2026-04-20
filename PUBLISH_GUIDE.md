# NPM 发布指南

本文档说明如何将本项目发布到 NPM，以及用户如何使用。

---

## 📦 方案选择

### 方案一：作为 Boilerplate/Template（✅ 推荐）

**特点**：
- 用户通过 GitHub Template 或 `git clone` 使用
- 不需要改造为 CLI 工具
- 维护简单，改动最小

**适用场景**：
- 项目是一个完整的后端脚手架
- 用户需要看到完整代码并自行修改
- 不想维护复杂的 CLI 逻辑

---

### 方案二：作为 CLI 工具（复杂）

**特点**：
- 用户通过 `npm install -g koa-server-cli` 安装
- 提供命令如 `koa-server create my-app`
- 需要从模板生成新项目

**适用场景**：
- 希望提供类似 vue-cli 的体验
- 愿意维护额外的 CLI 代码
- 需要支持多种模板选项

> **注意**：本指南主要介绍方案一。如需方案二，请参考文末的"CLI 工具改造方案"。

---

## 🚀 方案一：发布为 NPM Package（Boilerplate）

### 步骤 1：准备 NPM 账号

1. 访问 [npmjs.com](https://www.npmjs.com/) 注册账号
2. 验证邮箱
3. 本地登录：
   ```bash
   npm login
   ```

### 步骤 2：完善 package.json

已完成的配置：
- ✅ `name`: koa-server-boilerplate
- ✅ `version`: 1.0.0
- ✅ `description`: 项目描述
- ✅ `keywords`: 搜索关键词
- ✅ `author`: 作者信息
- ✅ `repository`: Git 仓库地址
- ✅ `license`: 许可证
- ✅ `main`: 入口文件

**需要修改的内容**：
```json
{
  "repository": {
    "url": "https://github.com/YOUR-USERNAME/koa-server-boilerplate.git"
  },
  "homepage": "https://github.com/YOUR-USERNAME/koa-server-boilerplate#readme",
  "bugs": {
    "url": "https://github.com/YOUR-USERNAME/koa-server-boilerplate/issues"
  }
}
```

将 `YOUR-USERNAME` 替换为你的 GitHub 用户名。

### 步骤 3：创建 .npmignore 文件

指定哪些文件不发布到 NPM：

```gitignore
# 依赖
node_modules/

# 环境变量
.env
.env.production
.env.example

# Git
.git/
.gitignore

# 文档
README.md
PUBLISH_GUIDE.md
LICENSE

# SQL 示例（可选，如果想包含则删除此行）
sql/

# 测试
test/
*.test.js

# IDE
.vscode/
.idea/

# 日志
logs/
*.log

# 上传文件
uploadDir/

# 其他
.DS_Store
Thumbs.db
```

创建文件：

```bash
# 在项目根目录创建
touch .npmignore
```

### 步骤 4：更新版本号

每次发布前更新版本号：

```bash
# 主版本（重大变更）
npm version major  # 1.0.0 -> 2.0.0

# 次版本（新功能）
npm version minor  # 1.0.0 -> 1.1.0

# 补丁版本（bug修复）
npm version patch  # 1.0.0 -> 1.0.1
```

或直接修改 `package.json` 中的 `version` 字段。

### 步骤 5：测试打包

在发布前测试打包是否正常：

```bash
# 查看将要发布的文件列表
npm pack --dry-run

# 实际打包（生成 .tgz 文件）
npm pack
```

检查输出的文件列表，确保没有包含不必要的文件。

### 步骤 6：发布到 NPM

```bash
# 首次发布
npm publish

# 如果包名已被占用，可以使用 scope
npm publish --access public
```

**注意事项**：
- 包名必须是唯一的
- 如果包名类似 `@username/package-name`，需要付费或使用 organization
- 发布后无法删除，只能废弃（deprecate）

### 步骤 7：验证发布

```bash
# 搜索包
npm search koa-server-boilerplate

# 查看包信息
npm info koa-server-boilerplate

# 安装包测试
npm install koa-server-boilerplate
```

---

## 👥 用户使用方式

### 方式 1：通过 NPM 安装（不推荐用于 boilerplate）

```bash
npm install koa-server-boilerplate
```

> ⚠️ 这种方式会将项目安装到 `node_modules`，不适合直接运行。

### 方式 2：通过 GitHub Template（✅ 推荐）

1. 访问 GitHub 仓库页面
2. 点击 "Use this template" 按钮
3. 创建自己的仓库
4. Clone 到本地：
   ```bash
   git clone https://github.com/your-username/your-new-repo.git
   cd your-new-repo
   npm install
   ```

### 方式 3：通过 Git Clone

```bash
git clone https://github.com/your-username/koa-server-boilerplate.git my-project
cd my-project
npm install
```

### 方式 4：通过 degit（推荐）

[degit](https://github.com/Rich-Harris/degit) 可以克隆仓库但不包含 Git 历史：

```bash
npx degit your-username/koa-server-boilerplate my-project
cd my-project
npm install
```

---

## 📝 README 中的使用说明

在 README 中添加以下内容：

```markdown
## 🚀 快速开始

### 方式 1: 使用 GitHub Template（推荐）

1. 点击本页面上的 "Use this template" 按钮
2. 创建你的新仓库
3. Clone 到本地并开始开发

### 方式 2: 使用 degit

```bash
npx degit your-username/koa-server-boilerplate my-project
cd my-project
npm install
```

### 方式 3: Git Clone

```bash
git clone https://github.com/your-username/koa-server-boilerplate.git my-project
cd my-project
npm install
```
```

---

## 🔄 版本更新流程

### 1. 开发新功能或修复 Bug

```bash
git checkout -b feature/new-feature
# 开发...
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

### 2. 合并到主分支

```bash
git checkout main
git merge feature/new-feature
```

### 3. 更新版本号

```bash
npm version patch  # 或 minor/major
git push origin main --tags
```

### 4. 发布到 NPM

```bash
npm publish
```

### 5. 创建 GitHub Release

在 GitHub 上创建新的 Release，标注版本号和更新内容。

---

## ⚠️ 常见问题

### Q1: 包名已被占用怎么办？

**解决方案**：
1. 更改包名（推荐）
2. 使用 scoped package：`@your-username/koa-server-boilerplate`
3. 联系原所有者转让（几乎不可能）

### Q2: 发布后发现有问题怎么办？

**解决方案**：
1. 修复问题
2. 更新版本号
3. 重新发布
4. 废弃旧版本：
   ```bash
   npm deprecate koa-server-boilerplate@1.0.0 "This version has a critical bug, please upgrade"
   ```

### Q3: 如何取消发布？

**注意**：NPM 不允许删除已发布的包（超过 24 小时后）。

只能在 72 小时内取消发布：
```bash
npm unpublish koa-server-boilerplate@1.0.0
```

### Q4: 如何设置访问权限？

**公开包**（默认）：
```bash
npm publish --access public
```

**私有包**（需要付费）：
```bash
npm publish --access restricted
```

---

## 🎯 CLI 工具改造方案（高级）

如果你想做成真正的 CLI 工具（如 vue-cli），需要以下改造：

### 1. 项目结构调整

```
koa-server-cli/
├── bin/
│   └── koa-server.js      # CLI 入口
├── templates/
│   └── default/           # 项目模板
│       ├── src/
│       ├── package.json
│       └── ...
├── src/
│   ├── create.js          # 创建项目逻辑
│   └── utils.js           # 工具函数
└── package.json
```

### 2. 添加 CLI 入口

`bin/koa-server.js`:
```javascript
#!/usr/bin/env node

const program = require('commander');
const createProject = require('../src/create');

program
  .version(require('../package.json').version)
  .command('create <project-name>')
  .description('Create a new Koa server project')
  .action((projectName) => {
    createProject(projectName);
  });

program.parse(process.argv);
```

### 3. 实现创建逻辑

`src/create.js`:
```javascript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function createProject(projectName) {
  const templatePath = path.join(__dirname, '../templates/default');
  const targetPath = path.join(process.cwd(), projectName);
  
  // 复制模板文件
  copyTemplate(templatePath, targetPath);
  
  // 安装依赖
  console.log('Installing dependencies...');
  execSync('npm install', { cwd: targetPath, stdio: 'inherit' });
  
  console.log(`Project ${projectName} created successfully!`);
}

module.exports = createProject;
```

### 4. 更新 package.json

```json
{
  "name": "koa-server-cli",
  "bin": {
    "koa-server": "./bin/koa-server.js"
  }
}
```

### 5. 用户使用

```bash
# 全局安装
npm install -g koa-server-cli

# 创建项目
koa-server create my-app
```

> **建议**：对于初学者，推荐使用方案一（Boilerplate），更简单且易于维护。

---

## 📊 两种方案对比

| 特性 | Boilerplate（方案一） | CLI Tool（方案二） |
|------|---------------------|-------------------|
| 开发难度 | ⭐ 简单 | ⭐⭐⭐ 复杂 |
| 维护成本 | 低 | 高 |
| 用户体验 | 中等 | 优秀 |
| 灵活性 | 高 | 中等 |
| 适合场景 | 完整项目模板 | 快速生成项目 |
| 示例项目 | express-generator | vue-cli, create-react-app |

---

## ✅ 发布前检查清单

- [ ] package.json 信息完整且正确
- [ ] README.md 文档完善
- [ ] .npmignore 配置正确
- [ ] 版本号已更新
- [ ] 本地测试通过
- [ ] Git 标签已推送
- [ ] NPM 账号已登录
- [ ] 包名未被占用

---

## 🔗 相关资源

- [NPM 官方文档](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Templates](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository)
- [degit](https://github.com/Rich-Harris/degit)

---

**祝发布顺利！🎉**
