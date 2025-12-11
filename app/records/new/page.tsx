'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Button from '@/components/Button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function NewRecordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [pets, setPets] = useState<any[]>([])

  const [formData, setFormData] = useState({
    petId: searchParams.get('petId') || '',
    type: searchParams.get('type') || 'deworming',
    date: new Date().toISOString().split('T')[0],
    // 通用字段
    notes: '',
    // 外驱/内驱字段
    brand: '',
    dosage: '',
    nextDueDate: '',
    // 洗澡字段
    products: '',
    location: '',
    // 疫苗字段
    vaccineType: '',
    institution: '',
    // 体重字段
    weight: '',
    unit: 'kg',
  })

  useEffect(() => {
    fetchPets()
  }, [])

  const fetchPets = async () => {
    try {
      const response = await fetch('/api/pets')
      if (response.ok) {
        const data = await response.json()
        setPets(data)
      }
    } catch (error) {
      console.error('Error fetching pets:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let endpoint = ''
      let body: any = {}

      switch (formData.type) {
        case 'deworming':
          endpoint = '/api/records/deworming'
          body = {
            petId: formData.petId,
            date: formData.date,
            brand: formData.brand,
            dosage: formData.dosage,
            nextDueDate: formData.nextDueDate || null,
            notes: formData.notes,
          }
          break
        case 'internal':
          endpoint = '/api/records/internal'
          body = {
            petId: formData.petId,
            date: formData.date,
            brand: formData.brand,
            dosage: formData.dosage,
            nextDueDate: formData.nextDueDate || null,
            notes: formData.notes,
          }
          break
        case 'bathing':
          endpoint = '/api/records/bathing'
          body = {
            petId: formData.petId,
            date: formData.date,
            products: formData.products,
            location: formData.location,
            notes: formData.notes,
          }
          break
        case 'vaccine':
          endpoint = '/api/records/vaccine'
          body = {
            petId: formData.petId,
            date: formData.date,
            type: formData.vaccineType,
            institution: formData.institution,
            nextDueDate: formData.nextDueDate || null,
            notes: formData.notes,
          }
          break
        case 'weight':
          endpoint = '/api/records/weight'
          body = {
            petId: formData.petId,
            date: formData.date,
            weight: parseFloat(formData.weight),
            unit: formData.unit,
            location: formData.location,
            notes: formData.notes,
          }
          break
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        router.push('/records')
        router.refresh()
      } else {
        alert('添加失败，请重试')
      }
    } catch (error) {
      console.error('Error creating record:', error)
      alert('添加失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'deworming':
      case 'internal':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  品牌 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="如：拜耳、福来恩"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  剂量 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="如：1片、2滴"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                下次到期日
              </label>
              <input
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </>
        )

      case 'bathing':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  洗护产品
                </label>
                <input
                  type="text"
                  value={formData.products}
                  onChange={(e) => setFormData({ ...formData, products: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="如：宠物专用沐浴露"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  洗澡地点
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="如：家里、宠物店"
                />
              </div>
            </div>
          </>
        )

      case 'vaccine':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  疫苗类型 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.vaccineType}
                  onChange={(e) => setFormData({ ...formData, vaccineType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="如：狂犬疫苗、三联疫苗"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  接种机构
                </label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="如：XX宠物医院"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                下次接种日
              </label>
              <input
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </>
        )

      case 'weight':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  体重 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="如：5.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  单位 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                测量地点
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="如：家里、宠物医院"
              />
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <main className="min-h-screen">
      <Navigation />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮 */}
        <Link
          href="/records"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          返回记录列表
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">添加健康记录</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 宠物和类型 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  宠物 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.petId}
                  onChange={(e) => setFormData({ ...formData, petId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">请选择宠物</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  记录类型 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="deworming">外驱</option>
                  <option value="internal">内驱</option>
                  <option value="bathing">洗澡</option>
                  <option value="vaccine">疫苗</option>
                  <option value="weight">体重</option>
                </select>
              </div>
            </div>

            {/* 日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* 类型特定字段 */}
            {renderTypeSpecificFields()}

            {/* 备注 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                备注
              </label>
              <textarea
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="记录一些额外信息..."
              />
            </div>

            {/* 提交按钮 */}
            <div className="flex items-center gap-4 pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? '添加中...' : '添加记录'}
              </Button>
              <Link href="/records">
                <Button variant="secondary" className="px-8">
                  取消
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default function NewRecordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <NewRecordForm />
    </Suspense>
  )
}
