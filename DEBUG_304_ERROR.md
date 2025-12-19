# 登录 304 错误调试指南

## 症状
- 登录页面返回 304 状态码
- 密码正确但点击登录无反应

## 304 状态码含义
`304 Not Modified` - 通常用于 GET 请求的缓存，但 POST 请求返回 304 异常。

## 调试步骤

### 步骤 1：打开浏览器开发者工具
```
F12 → Console 面板
```

### 步骤 2：清除控制台
点击清空按钮（🚫）

### 步骤 3：测试登录并观察控制台
应该看到以下日志（按顺序）：
1. `Form submitted {email: "..."}`
2. `Calling signIn...`
3. `SignIn result: {ok: true}` 或 `{error: "..."}`

### 步骤 4：检查 Network 面板
```
F12 → Network 面板
再次点击登录按钮
```

应该看到：
- `POST /api/auth/callback/credentials` - 登录请求
- `GET /` - 跳转首页（如果成功）

## 常见问题和解决方案

### 问题 A：控制台没有日志
**原因**：JavaScript 错误阻止执行
**解决**：
1. 查看 Console 是否有红色错误
2. 刷新页面，清除缓存
3. 尝试无痕/隐私模式

### 问题 B：Form submitted 但没有 signIn 日志
**原因**：`signIn` 函数调用失败
**解决**：
1. 检查 NextAuth 配置
2. 查看 Network 面板是否有请求发出

### 问题 C：Network 返回 304
**可能原因**：
1. 代理服务器缓存
2. 浏览器缓存
3. 中间件重定向

**解决**：
1. 清除浏览器缓存（Ctrl+Shift+R 硬刷新）
2. 尝试无痕模式
3. 检查 Vercel/代理配置

### 问题 D：signIn 返回错误
**观察**：`SignIn result: {error: "..."}`

**常见错误**：
- `Invalid credentials` - 密码错误
- `Configuration` - NextAuth 配置错误
- `Missing secret` - 已修复

## 替代方案

如果调试无效，我们可以：

### 方案 1：简化登录流程
移除 NextAuth，使用自定义 session：
```typescript
// 登录 API
const response = await fetch('/api/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
})
```

### 方案 2：添加 SessionProvider
在 layout.tsx 中添加：
```typescript
import { SessionProvider } from 'next-auth/react'
```

### 方案 3：检查中间件
中间件可能阻止了登录重定向，检查 `middleware.ts`。

## 下一步

请按照调试步骤操作，并告诉我：
1. Console 面板看到了什么？
2. Network 面板有什么请求？
3. 是否有任何错误信息？

---

**日期**：2025-12-12
**状态**：调试中
