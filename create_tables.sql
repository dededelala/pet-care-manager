-- 宠物健康管理系统数据库表创建脚本
-- 在 Vercel Postgres 或 Neon 数据库中直接执行此 SQL

-- 创建 pets 表
CREATE TABLE "pets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "breed" TEXT,
    "birthday" TIMESTAMP(3),
    "gender" TEXT,
    "color" TEXT,
    "photo" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- 创建外驱记录表
CREATE TABLE "deworming_records" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "brand" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "nextDueDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "deworming_records_pkey" PRIMARY KEY ("id")
);

-- 创建内驱记录表
CREATE TABLE "internal_deworming_records" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "brand" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "nextDueDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "internal_deworming_records_pkey" PRIMARY KEY ("id")
);

-- 创建洗澡记录表
CREATE TABLE "bathing_records" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "products" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bathing_records_pkey" PRIMARY KEY ("id")
);

-- 创建疫苗记录表
CREATE TABLE "vaccine_records" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "institution" TEXT,
    "nextDueDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vaccine_records_pkey" PRIMARY KEY ("id")
);

-- 创建体重记录表
CREATE TABLE "weight_records" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "weight_records_pkey" PRIMARY KEY ("id")
);

-- 创建外键约束
ALTER TABLE "deworming_records" ADD CONSTRAINT "deworming_records_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "internal_deworming_records" ADD CONSTRAINT "internal_deworming_records_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bathing_records" ADD CONSTRAINT "bathing_records_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vaccine_records" ADD CONSTRAINT "vaccine_records_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "weight_records" ADD CONSTRAINT "weight_records_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 创建索引（可选，用于性能优化）
CREATE INDEX "deworming_records_petId_idx" ON "deworming_records"("petId");
CREATE INDEX "internal_deworming_records_petId_idx" ON "internal_deworming_records"("petId");
CREATE INDEX "bathing_records_petId_idx" ON "bathing_records"("petId");
CREATE INDEX "vaccine_records_petId_idx" ON "vaccine_records"("petId");
CREATE INDEX "weight_records_petId_idx" ON "weight_records"("petId");
