# 🐾 宠物健康管理系统

一个专业的宠物健康护理记录与管理平台，帮助宠物主人科学管理宠物的健康信息。

![宠物健康管理系统](./public/preview.png)

## ✨ 功能特性

### 📋 核心功能

- **宠物档案管理**
  - 添加/编辑/删除宠物信息（名字、品种、生日、性别、毛色、照片、备注）
  - 宠物列表展示和详情查看
  - 支持宠物照片上传

- **健康护理记录**
  - 外驱记录：日期、品牌、剂量、下次到期日
  - 内驱记录：日期、品牌、剂量、下次到期日
  - 洗澡记录：日期、洗护产品、洗澡地点
  - 疫苗记录：日期、疫苗类型、接种机构、下次接种日
  - 体重记录：日期、体重（kg/g）、测量地点

- **智能提醒**
  - 即将到期提醒（7天内）
  - 首页展示紧急提醒事项
  - 记录卡片显示到期状态

- **数据可视化**
  - 体重趋势图表
  - 使用 Chart.js 实现交互式图表
  - 支持多宠物数据对比

- **数据筛选**
  - 按宠物筛选记录
  - 按记录类型筛选（外驱、内驱、洗澡、疫苗、体重）
  - 支持组合筛选

## 🛠 技术栈

- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据库**: Vercel Postgres / Neon
- **ORM**: Prisma
- **图表**: Chart.js + react-chartjs-2
- **日期处理**: date-fns
- **图标**: Lucide React
- **部署**: Vercel

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 本地开发

1. **克隆项目**

```bash
git clone <your-repo-url>
cd pet-care-manager
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

复制环境变量模板：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，添加你的数据库连接字符串：

```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

4. **初始化数据库**

运行 Prisma 迁移：

```bash
npx prisma migrate dev --name init
```

5. **启动开发服务器**

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🌐 Vercel 部署

### 方式一：使用 Vercel Postgres（推荐）

1. **在 Vercel 中创建项目**

   - 访问 [Vercel 控制台](https://vercel.com/dashboard)
   - 点击 "New Project"
   - 导入你的 GitHub 仓库

2. **创建 Vercel Postgres 数据库**

   - 在项目设置中，选择 "Storage" 标签
   - 点击 "Create Database"
   - 选择 "Postgres"
   - 复制连接字符串

3. **配置环境变量**

   在 Vercel 项目设置中添加环境变量：

   ```
   DATABASE_URL=postgresql://...
   ```

4. **部署项目**

   - Vercel 会自动检测到 Next.js 项目
   - 点击 "Deploy"
   - 等待部署完成

### 方式二：使用 Neon 数据库

1. **创建 Neon 数据库**

   - 访问 [Neon 控制台](https://neon.tech)
   - 创建新项目
   - 复制连接字符串

2. **部署到 Vercel**

   按照上述步骤 1、3、4 操作

## 📁 项目结构

```
pet-care-manager/
├── app/                      # Next.js App Router
│   ├── api/                  # API 路由
│   │   ├── pets/             # 宠物相关 API
│   │   └── records/          # 记录相关 API
│   ├── pets/                 # 宠物管理页面
│   ├── records/              # 记录管理页面
│   ├── charts/               # 数据图表页面
│   ├── layout.tsx            # 根布局
│   └── page.tsx              # 首页
├── components/               # React 组件
│   ├── Navigation.tsx        # 导航栏
│   ├── PetCard.tsx           # 宠物卡片
│   ├── RecordCard.tsx        # 记录卡片
│   ├── Button.tsx            # 按钮组件
│   └── WeightChart.tsx       # 体重图表
├── lib/                      # 工具库
│   └── prisma.ts             # Prisma 客户端
├── prisma/                   # 数据库相关
│   └── schema.prisma         # Prisma Schema
├── public/                   # 静态资源
├── .env.example              # 环境变量模板
├── vercel.json               # Vercel 配置
└── README.md                 # 项目文档
```

## 🔧 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | 数据库连接字符串 | `postgresql://user:password@host:port/database?sslmode=require` |

## 📊 数据库 Schema

### Pet (宠物)
- `id`: 唯一标识
- `name`: 名字（必填）
- `breed`: 品种
- `birthday`: 生日
- `gender`: 性别
- `color`: 毛色
- `photo`: 照片 URL
- `notes`: 备注

### 健康记录表
- **DewormingRecord** (外驱记录)
- **InternalDewormingRecord** (内驱记录)
- **BathingRecord** (洗澡记录)
- **VaccineRecord** (疫苗记录)
- **WeightRecord** (体重记录)

每个记录表都包含：
- 关联的宠物 ID (petId)
- 日期 (date)
- 备注 (notes)
- 创建时间 (createdAt)

## 🎨 自定义配置

### 修改主题颜色

项目使用 Tailwind CSS 的渐变色主题，主要颜色为：
- 主色：Pink (#ec4899)
- 辅助色：Purple (#9333ea)
- 背景：渐变粉色到紫色

修改 `app/layout.tsx` 中的背景渐变，或在 Tailwind 配置中自定义颜色。

### 添加新记录类型

1. 在 `prisma/schema.prisma` 中添加新模型
2. 在 `app/api/records/` 下创建 API 路由
3. 在 `app/records/new/page.tsx` 中添加表单
4. 在 `components/RecordCard.tsx` 中添加显示逻辑

## 🧪 测试

```bash
# 运行测试
npm test

# 运行测试并查看覆盖率
npm run test:coverage
```

## 📈 性能优化

- ✅ 使用 Next.js App Router 进行服务器端渲染
- ✅ 图片优化（Next.js Image 组件）
- ✅ 代码分割和懒加载
- ✅ Prisma 连接池优化
- ✅ 响应式设计，支持移动端

## 🔒 安全考虑

- 所有 API 路由都包含错误处理
- 使用 TypeScript 保证类型安全
- 环境变量不提交到代码仓库
- 建议在生产环境中添加认证机制

## 🤝 功能扩展建议

### 短期优化
- [ ] 添加用户认证（NextAuth.js）
- [ ] 实现记录编辑和删除功能
- [ ] 添加数据导出功能（CSV/PDF）
- [ ] 实现照片上传到云存储

### 长期规划
- [ ] 多用户支持
- [ ] 宠物医院/诊所预约系统
- [ ] 药品库存管理
- [ ] 健康报告自动生成
- [ ] 移动端 App
- [ ] 微信小程序版本

### 高级功能
- [ ] AI 健康建议
- [ ] 症状自查系统
- [ ] 社区交流功能
- [ ] 宠物社交网络
- [ ] 兽医在线咨询

## 📝 开发日志

- ✅ 项目初始化和基础架构
- ✅ 数据库 Schema 设计
- ✅ UI 组件和布局
- ✅ 宠物档案管理
- ✅ 健康记录模块
- ✅ 数据可视化（体重趋势图）
- ✅ 提醒和筛选功能
- ✅ Vercel 部署配置

## 🐛 已知问题

- 暂未发现重大问题
- 如发现问题请提交 Issue

## 📄 许可证

MIT License

## 👨‍💻 作者

Claude Code - Anthropic 官方 CLI

## 🙏 致谢

- [Next.js](https://nextjs.org) - React 框架
- [Tailwind CSS](https://tailwindcss.com) - CSS 框架
- [Prisma](https://prisma.io) - 数据库 ORM
- [Chart.js](https://chartjs.org) - 图表库
- [Vercel](https://vercel.com) - 部署平台
- [Lucide](https://lucide.dev) - 图标库

## 📞 联系我们

如有问题或建议，请通过以下方式联系：

- 提交 [GitHub Issue](https://github.com/your-repo/issues)
- 发送邮件至：your-email@example.com

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
