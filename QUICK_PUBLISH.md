# NPM 发布快速指南

## 🚀 快速发布步骤

### 1. 首次准备（只需做一次）

```bash
# 注册 NPM 账号
# 访问 https://www.npmjs.com/signup

# 本地登录
npm login

# 输入用户名、密码、邮箱
```

### 2. 修改 package.json 中的仓库地址

将 `` 替换为你的 GitHub 用户名：

```json
{
  "repository": {
    "url": "https://github.com/YOUR-USERNAME/koa-server-boilerplate.git"
  }
}
```

### 3. 测试打包

```bash
# 查看将要发布的文件
npm pack --dry-run

# 实际打包测试
npm pack
```

检查输出，确保没有包含不必要的文件。

### 4. 更新版本号

```bash
# 选择一种方式
npm version patch  # 1.0.0 -> 1.0.1 (bug修复)
npm version minor  # 1.0.0 -> 1.1.0 (新功能)
npm version major  # 1.0.0 -> 2.0.0 (重大变更)
```

### 5. 推送到 Git

```bash
git add .
git commit -m "chore: release v1.0.0"
git push origin main --tags
```

### 6. 发布到 NPM

```bash
npm publish
```

### 7. 验证发布

```bash
# 搜索包
npm search koa-server-boilerplate

# 查看信息
npm info koa-server-boilerplate
```

---

## 📦 用户使用方式

### 推荐方式 1: GitHub Template

1. 访问你的 GitHub 仓库
2. 点击 "Use this template"
3. 创建新仓库
4. Clone 并开始开发

### 推荐方式 2: degit

```bash
npx degit lys505735364/koa-server-boilerplate my-project
cd my-project
npm install
npm run dev
```

### 方式 3: Git Clone

```bash
git clone https://github.com/lys505735364/koa-server-boilerplate.git my-project
cd my-project
npm install
npm run dev
```

---

## 🔄 后续更新

```bash
# 1. 开发新功能
git checkout -b feature/xxx
# 开发...

# 2. 合并到主分支
git checkout main
git merge feature/xxx

# 3. 更新版本
npm version patch  # 或 minor/major

# 4. 推送
git push origin main --tags

# 5. 发布
npm publish
```

---

## ⚠️ 注意事项

1. **包名唯一性**：`koa-server-boilerplate` 必须未被占用
2. **版本号递增**：每次发布必须更新版本号
3. **不可删除**：发布后无法删除包，只能废弃
4. **.npmignore**：确保敏感信息不被发布

---

## 📝 检查清单

发布前确认：

- [ ] package.json 信息正确
- [ ] README.md 已更新
- [ ] .npmignore 配置正确
- [ ] 版本号已更新
- [ ] 代码已提交到 Git
- [ ] 本地测试通过
- [ ] NPM 已登录

---

## 🆘 常见问题

### 包名被占用？

更改 package.json 中的 name：
```json
{
  "name": "@lys505735364/koa-server-boilerplate"
}
```

### 发布失败？

检查：
1. 是否已登录：`npm whoami`
2. 包名是否唯一
3. 版本号是否已更新
4. 网络连接是否正常

### 如何撤回发布？

72小时内可以撤回：
```bash
npm unpublish koa-server-boilerplate@1.0.0
```

超过72小时只能废弃：
```bash
npm deprecate koa-server-boilerplate@1.0.0 "Deprecated, please use newer version"
```

---

## 📚 详细文档

查看 [PUBLISH_GUIDE.md](./PUBLISH_GUIDE.md) 了解更多信息。
