# Edge Function 大小限制修复

## 问题描述

**错误信息**：
```
The Edge Function "middleware" size is 1.02 MB and your plan size limit is 1 MB.
```

**影响**：无法部署到 Vercel（免费计划限制 1MB）

## 根本原因

中间件文件导入了 `@/lib/auth`，导致 Prisma、bcrypt 等重型依赖被打包到 Edge Function 中：

```typescript
import { auth } from '@/lib/auth'  // ❌ 问题源头
```

## 解决方案

### 策略：分层验证

| 层级 | 职责 | 实现方式 |
|------|------|----------|
| **中间件** | 性能优化 | 简单 cookie 检查 |
| **API 路由** | 安全保障 | 完整 session 验证 |

### 修复后的中间件

**`middleware.ts`** - 轻量级实现：
```typescript
import { NextResponse } from 'next/server'

export default async function middleware(req: Request) {
  const { nextUrl } = req as any

  // 公共路径（无需认证）
  const isPublicPath = nextUrl.pathname.startsWith('/auth') ||
                       nextUrl.pathname.startsWith('/api/auth') ||
                       nextUrl.pathname.startsWith('/_next') ||
                       nextUrl.pathname.startsWith('/favicon.ico')

  if (!isPublicPath) {
    // 简单检查：是否有 session cookie
    const cookieHeader = req.headers.get('cookie')

    if (!cookieHeader) {
      return NextResponse.redirect(new URL('/auth/login', nextUrl))
    }

    // 检查 NextAuth cookie 存在性
    const hasSession = cookieHeader.includes('next-auth.session-token') ||
                      cookieHeader.includes('__Secure-next-auth.session-token')

    if (!hasSession) {
      return NextResponse.redirect(new URL('/auth/login', nextUrl))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}
```

### API 路由 - 完整验证

**API 路由继续使用完整验证**：
```typescript
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 继续处理请求...
}
```

## 权衡分析

### ✅ 优点
1. **部署成功**：Edge Function < 1MB
2. **性能优化**：中间件快速响应
3. **向后兼容**：API 路由仍验证完整 session
4. **渐进式**：可以后续优化

### ⚠️ 注意事项
1. **安全性**：中间件只检查 cookie 存在性，不验证有效性
2. **体验**：过期 session 会在 API 请求时才被发现
3. **调试**：过期 session 会导致 401 错误（而不是登录页）

### 📊 安全级别

| 场景 | 保护级别 |
|------|----------|
| 访问受保护页面 | 基础（cookie 存在性） |
| API 请求 | 完整（session 有效性） |
| 敏感操作 | 完整（session 验证） |

## 测试建议

### 测试场景 1：未登录用户
1. 直接访问 `/pets`
2. **期望**：自动重定向到 `/auth/login`

### 测试场景 2：已登录用户
1. 登录成功
2. 访问 `/pets`
3. **期望**：正常显示页面

### 测试场景 3：过期 session
1. 登录成功
2. 手动删除 session cookie
3. 访问 `/pets`
4. **实际**：显示页面（cookie 存在性检查通过）
5. **API 请求**：返回 401（完整验证）

## 优化建议

### 方案 1：Vercel Pro
- 升级到 Pro 计划（10MB 限制）
- 恢复完整中间件验证

### 方案 2：精细化中间件
- 区分敏感页面和普通页面
- 仅对敏感页面使用完整验证

### 方案 3：Session 缓存
- 将 session 验证结果缓存
- 减少数据库查询

## 相关文件

- `middleware.ts` - 轻量级中间件
- `app/api/*/route.ts` - 完整验证的 API 路由
- `lib/auth.ts` - NextAuth 配置

---

**状态**：✅ 已修复
**部署**：✅ 可部署到 Vercel 免费计划
**安全级别**：中等（分层验证）
**日期**：2025-12-12
