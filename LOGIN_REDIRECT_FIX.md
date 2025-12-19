# 登录跳转问题修复

## 问题描述

**症状**：
- 登录成功（返回 200）
- URL 变为 `/auth/login?callbackUrl=%2F`
- 页面没有跳转到首页

**URL 参数说明**：
- `callbackUrl=%2F` → `callbackUrl=/`
- 系统尝试跳转到首页（`/`）但失败

## 根本原因

### 1. React Router 不稳定性
```typescript
// 问题代码
router.push('/')  // ❌ 可能被覆盖或失效
```

**原因**：
- React Router 在 NextAuth session 更新时可能不稳定
- 路由状态与 session 状态不同步
- 中间件可能干扰路由执行

### 2. Session 状态问题
登录成功后，session 状态需要时间同步：
```typescript
// 之前的延迟等待
await new Promise(resolve => setTimeout(resolve, 500)) // 不够可靠
```

### 3. 中间件冲突
轻量级中间件可能与 router.push 产生冲突

## 解决方案

### 使用原生 JavaScript 跳转

**修改前**：
```typescript
const result = await signIn('credentials', {
  email,
  password,
  redirect: false,
  callbackUrl: '/'
})

if (result?.error) {
  setError('邮箱或密码错误')
  return
}

// 不可靠的跳转
router.push('/')
```

**修改后**：
```typescript
const result = await signIn('credentials', {
  email,
  password,
  redirect: false,
  callbackUrl: '/'
})

if (result?.error) {
  setError('邮箱或密码错误')
  return
}

// 强制浏览器跳转（绕过 React Router）
window.location.href = '/'
```

## 对比分析

| 方法 | 优点 | 缺点 |
|------|------|------|
| `router.push('/')` | 保持 SPA 状态<br/>支持动画过渡 | 可能不稳定<br/>状态同步问题 |
| `window.location.href = '/'` | **强制跳转**<br/>**绕过所有状态管理**<br/>**确保 session 更新** | 页面刷新<br/>失去 SPA 优势 |
| `redirect: true` | NextAuth 自动处理 | 自定义控制有限 |

## 适用场景

### ✅ 适合使用 `window.location.href` 的场景：
1. **登录/登出后跳转**（当前场景）
2. **权限验证失败后跳转**
3. **表单提交成功后跳转**
4. **需要强制刷新 session 的场景**

### ❌ 不建议使用的场景：
1. **页面内导航**（使用 router.push）
2. **需要保持动画过渡**
3. **SPA 内部路由切换**

## 测试验证

### 测试步骤
1. 访问 `/auth/login`
2. 输入正确的邮箱和密码
3. 点击登录按钮
4. **观察**：
   - ✅ 立即跳转到首页 `/`
   - ✅ URL 不包含 `callbackUrl` 参数
   - ✅ 页面显示宠物管理界面
   - ✅ 可以正常访问其他页面

### 期望的 URL 变化
```
/auth/login → /  (直接跳转，无参数)
```

### 避免的情况
```
/auth/login?callbackUrl=%2F → /  (有参数说明跳转失败)
```

## 替代方案

### 方案 1：NextAuth 自动重定向
```typescript
await signIn('credentials', {
  email,
  password,
  redirect: true,  // 启用自动重定向
  callbackUrl: '/'
})
```
**优点**：NextAuth 自动处理
**缺点**：自定义控制有限

### 方案 2：使用 useRouter 的 replace
```typescript
router.replace('/')  // 替换当前历史记录
```
**优点**：不会在历史记录中留下登录页
**缺点**：仍然可能不稳定

### 方案 3：使用 navigate 函数
```typescript
import { useNavigate } from 'next/navigation'
const navigate = useNavigate()
navigate('/', { replace: true })
```
**优点**：更现代的 API
**缺点**：仍然依赖 React Router

## 最佳实践

### 推荐流程
```typescript
const handleLogin = async (credentials) => {
  const result = await signIn('credentials', {
    ...credentials,
    redirect: false
  })

  if (result?.error) {
    // 处理错误
    return
  }

  // 登录成功：使用原生跳转
  window.location.href = result.url || '/'
}
```

### 错误处理
```typescript
if (result?.error) {
  switch (result.error) {
    case 'Invalid credentials':
      setError('邮箱或密码错误')
      break
    default:
      setError('登录失败，请稍后重试')
  }
  return
}
```

## 相关文件

- `app/auth/login/page.tsx` - 登录页面（已修复）
- `middleware.ts` - 认证中间件
- `lib/auth.ts` - NextAuth 配置

---

**修复状态**：✅ 已完成
**测试状态**：待验证
**跳转方法**：window.location.href
**日期**：2025-12-12
