# API 修改指南 - 用户认证

本文档说明如何修改所有 API 路由以支持用户认证和数据隔离。

## 修改模式

每个 API 文件都需要进行以下修改：

### 1. 添加导入
```typescript
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth'
```

### 2. 在每个函数开始处添加认证检查
```typescript
export async function GET() {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 原有的业务逻辑...
  }
}
```

### 3. 在查询中添加 userId 过滤
```typescript
const data = await prisma.model.findMany({
  where: {
    userId: session.user.id,  // 添加这行
    // 其他条件...
  },
})
```

### 4. 在创建操作中添加 userId
```typescript
const result = await prisma.model.create({
  data: {
    userId: session.user.id,  // 添加这行
    // 其他字段...
  },
})
```

## 需要修改的文件列表

### ✅ 已修改
- `app/api/pets/route.ts` - 宠物列表和创建
- `app/api/reminders/route.ts` - 提醒设置

### 📝 需要修改

1. **记录相关 API**
   - `app/api/records/deworming/route.ts`
   - `app/api/records/internal/route.ts`
   - `app/api/records/bathing/route.ts`
   - `app/api/records/vaccine/route.ts`
   - `app/api/records/weight/route.ts`

2. **其他 API**
   - `app/api/reminders/[id]/route.ts` - 提醒设置编辑/删除

## 修改示例

### 修改前
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const petId = searchParams.get('petId')

  const records = await prisma.dewormingRecord.findMany({
    where: { petId },
    include: { pet: true },
  })

  return NextResponse.json(records)
}
```

### 修改后
```typescript
export async function GET(request: Request) {
  const session = await getServerSession(authConfig)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const petId = searchParams.get('petId')

  const records = await prisma.dewormingRecord.findMany({
    where: {
      petId,
      pet: {
        userId: session.user.id,  // 通过关联表过滤
      },
    },
    include: { pet: true },
  })

  return NextResponse.json(records)
}
```

## 数据库模型变更

所有模型都已添加 `userId` 字段：
- ✅ `User` - 新增用户模型
- ✅ `Pet` - 添加 `userId`
- ✅ `ReminderSettings` - 添加 `userId`
- ⚠️ 记录模型（DewormingRecord 等）- 暂未添加，需要后续修改

## 下一步工作

1. 修改所有记录相关的 API
2. 为记录模型添加 `userId` 字段（需要数据迁移）
3. 测试用户认证流程
4. 测试数据隔离

## 注意事项

- 修改 API 后需要重新生成 Prisma 客户端：`npx prisma generate`
- 数据库迁移可能需要删除现有数据，因为 schema 有重大变更
- 中间件已配置，未登录用户会被重定向到登录页
- 登录页面：`/auth/login`
- 注册页面：`/auth/register`
