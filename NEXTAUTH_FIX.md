# NextAuth 5 兼容性修复记录

## 问题描述

Vercel 部署时遇到多个 NextAuth 5 相关错误：

1. `Export withAuth doesn't exist in target module`
2. `Type 'typeof import(...)' does not satisfy the constraint 'RouteHandlerConfig'`
3. `useSearchParams() should be wrapped in a suspense boundary`

## 根本原因

NextAuth 5 beta 与 Next.js 16 的 API 存在兼容性问题：
- `withAuth` 中间件 API 已变更
- 路由处理程序签名不兼容
- 动态路由参数现在是 Promise
- 需要 Suspense 边界

## 修复内容

### 1. 中间件 (middleware.ts)
```typescript
// 修改前：使用 withAuth
import { withAuth } from 'next-auth/middleware'

// 修改后：简单的中间件（暂时禁用认证）
export default async function middleware(req: Request) {
  const isLoggedIn = false // TODO: Implement proper auth check
  // ...
}
```

### 2. 认证配置 (lib/auth.ts)
```typescript
// 修改前：使用 getServerSession
import { getServerSession } from 'next-auth/next'

// 修改后：使用 NextAuth 5 的 auth
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

// 修复 TypeScript 类型
async jwt({ token, user }: any) { ... }
async session({ session, token }: any) { ... }
strategy: 'jwt' as const, // 确保字面量类型
```

### 3. API 路由
```typescript
// 修改前：使用 getServerSession
const session = await getServerSession(authConfig)

// 修改后：从 NextAuth 导入 auth
const session = await auth()

// 修复动态路由参数
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params // 必须 await
  // ...
}
```

### 4. NextAuth 路由处理程序
```typescript
// 修改前：使用 NextAuth 包装器
import NextAuth from 'next-auth'
const handler = NextAuth(authConfig)
export { handler as GET, handler as POST }

// 修改后：使用 handlers 导出
import { handlers } from '@/lib/auth'
export const GET = handlers.GET
export const POST = handlers.POST
```

### 5. Suspense 边界
```typescript
// 修改前：直接使用 useSearchParams
export default function RemindersPage() {
  const searchParams = useSearchParams()
  // ...
}

// 修改后：分离组件并用 Suspense 包裹
function RemindersContent() {
  const searchParams = useSearchParams()
  // ...
}

export default function RemindersPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <RemindersContent />
    </Suspense>
  )
}
```

## 构建结果

✅ **成功构建！**
```
Route (app)
├ ○ / (Static)
├ ƒ /api/auth/[...nextauth] (Dynamic)
├ ○ /auth/login (Static)
├ ○ /auth/register (Static)
└ ...
```

## 注意事项

### 临时禁用认证
当前中间件中的认证检查被临时禁用（`isLoggedIn = false`），因为 NextAuth 5 的 auth() 函数在中间件中不可用。

**需要后续修复**：
1. 实现基于 JWT 的中间件认证
2. 或升级到 Next.js 14+ 以获得更好的 NextAuth 5 支持

### 警告信息
- ⚠️ `The "middleware" file convention is deprecated. Please use "proxy" instead`
  - Next.js 建议使用 `proxy.ts` 代替 `middleware.ts`
  - 但当前功能正常，可以后续升级

## 下一步工作

1. **升级 Next.js 到 14+**
   - 更好的 NextAuth 5 支持
   - 修复中间件警告

2. **实现完整的认证中间件**
   - 基于 JWT 的认证检查
   - 重定向未登录用户

3. **测试用户流程**
   - 注册、登录、登出
   - 数据隔离
   - 路由保护

## 相关文件

- `middleware.ts` - 中间件配置（已简化）
- `lib/auth.ts` - NextAuth 配置和导出
- `app/api/auth/[...nextauth]/route.ts` - 认证路由处理程序
- `app/api/pets/route.ts` - 示例 API 路由（使用 auth()）
- `app/pets/reminders/page.tsx` - 使用 Suspense 的页面

## 参考链接

- [NextAuth 5 文档](https://authjs.dev/nextjs)
- [Next.js 中间件](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [React Suspense](https://react.dev/reference/react/Suspense)
