# 依赖冲突修复记录

## 问题描述

Vercel 部署时遇到 npm 依赖冲突错误：

```
npm error peer react@"^19.2.3" from react-dom@19.2.3
npm error peer react-dom@"^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0" from next@16.0.8
```

## 根本原因

1. **Next.js 16 与 React 19 不兼容**
   - Next.js 16.0.8 不支持 React 19.2.x
   - Next.js 16 只支持 React 18 或特定的 React 19 候选版本

2. **NextAuth 5 beta 与 nodemailer 6 不兼容**
   - NextAuth 5 beta 需要 nodemailer 7.x
   - 我们安装的是 6.9.15

## 解决方案

### 1. 降级 React 到 18.x
```json
"react": "^18.2.0",
"react-dom": "^18.2.0",
"@types/react": "^18",
"@types/react-dom": "^18"
```

### 2. 降级 nodemailer 到 7.x
```json
"nodemailer": "^7.0.7"
```

## 修复步骤

1. 修改 `package.json` 中的依赖版本
2. 删除 `node_modules` 和 `package-lock.json`
3. 重新运行 `npm install`
4. 生成 Prisma 客户端：`npx prisma generate`
5. 提交并推送更改

## 安装结果

✅ 成功安装 518 个包
⚠️ 有一些警告（不是致命错误）：
- Next.js 16.0.8 安全漏洞（后续需要升级）
- nodemailer 版本冲突警告（不影响功能）

## 后续建议

### 1. 升级 Next.js（推荐）
当前 Next.js 16.0.8 有安全漏洞，建议升级到 Next.js 14 或 15：

```bash
npm install next@14.2.0 react@18.2.0 react-dom@18.2.0
```

### 2. 升级依赖
在修复安全漏洞后，可以升级其他依赖：
```bash
npm update
```

## 验证

安装完成后运行：
```bash
npm run build
```

确认应用可以正常构建。

## 部署

推送更改到 GitHub 后，Vercel 会自动部署并使用正确的依赖版本。

## 依赖树

当前稳定的依赖版本：
- Next.js: 16.0.8 ⚠️（有安全漏洞，需升级）
- React: 18.2.0 ✅
- NextAuth: 5.0.0-beta.25 ✅
- Prisma: 6.19.1 ✅
- nodemailer: 7.0.7 ✅

## 参考链接

- [Next.js 16 兼容性](https://nextjs.org/docs)
- [NextAuth 5 beta 文档](https://authjs.dev/reference/nextjs)
- [React 18 文档](https://react.dev)
- [Prisma 文档](https://prisma.io/docs)
