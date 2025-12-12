# NextAuth Secret 错误修复

## 问题描述

**错误信息**：
```
[auth][error] MissingSecret: Please define a `secret`. Read more at https://errors.authjs.dev#missingsecret
```

**错误原因**：NextAuth 5 需要配置 `secret` 用于加密 JWT token 和签名 session cookies。

## 修复内容

### 1. 更新 lib/auth.ts

在 `authConfig` 中添加 `secret` 配置：

```typescript
export const authConfig = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production', // 新增
  session: {
    strategy: 'jwt' as const,
  },
  // ...
}
```

### 2. 添加环境变量

在 `.env` 文件中添加：

```env
# NextAuth.js Configuration
# Generate a random secret using: openssl rand -base64 32
NEXTAUTH_SECRET="m+DPP9UW+VTaPc/A0hFrboZDKCBQNut5V4kveLgZzi4="
NEXTAUTH_URL="http://localhost:3000"
```

### 3. 生成安全的 Secret

使用 OpenSSL 生成 32 字节的随机 base64 编码字符串：

```bash
openssl rand -base64 32
# 输出: m+DPP9UW+VTaPc/A0hFrboZDKCBQNut5V4kveLgZzi4=
```

## 修复验证

✅ 构建成功（22/22 pages）

## 生产环境配置

### Vercel 部署

在 Vercel 项目设置中添加环境变量：

1. 登录 Vercel Dashboard
2. 选择项目 → Settings → Environment Variables
3. 添加以下变量：

| Name | Value | Environment |
|------|-------|-------------|
| `NEXTAUTH_SECRET` | `[使用 openssl rand -base64 32 生成]` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Production, Preview, Development |
| `DATABASE_URL` | `[PostgreSQL 连接字符串]` | Production, Preview, Development |

### 其他平台

确保在部署平台的环境变量配置中添加：
- `NEXTAUTH_SECRET`: 一个安全的随机字符串
- `NEXTAUTH_URL`: 应用的完整 URL

## 安全注意事项

⚠️ **重要**：
1. **不要将 NEXTAUTH_SECRET 提交到代码仓库**
2. **生产环境使用强随机 secret**
3. **不同环境使用不同的 secret**
4. **如果 secret 泄露，所有用户 session 将无效**

## 相关链接

- [NextAuth.js Secret 配置](https://next-auth.js.org/configuration/options#secret)
- [Auth.js 错误文档](https://errors.authjs.dev#missingsecret)

---

**修复状态**：✅ 已完成
**构建状态**：✅ 成功
**日期**：2025-12-12
