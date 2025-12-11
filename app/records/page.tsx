'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import RecordCard from '@/components/RecordCard'
import Link from 'next/link'
import { Plus, Filter } from 'lucide-react'

function RecordsContent() {
  const searchParams = useSearchParams()
  const [pets, setPets] = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const petId = searchParams.get('petId') || ''
  const type = searchParams.get('type') || 'all'

  useEffect(() => {
    fetchData()
  }, [petId, type])

  const fetchData = async () => {
    try {
      // 获取宠物列表
      const petsResponse = await fetch('/api/pets')
      if (petsResponse.ok) {
        const petsData = await petsResponse.json()
        setPets(petsData)
      }

      // 获取记录
      let recordsData: any[] = []

      if (!type || type === 'all') {
        // 获取所有类型的记录
        const [deworming, internal, bathing, vaccine, weight] = await Promise.all([
          fetch('/api/records/deworming' + (petId ? `?petId=${petId}` : '')).then(r => r.json()),
          fetch('/api/records/internal' + (petId ? `?petId=${petId}` : '')).then(r => r.json()),
          fetch('/api/records/bathing' + (petId ? `?petId=${petId}` : '')).then(r => r.json()),
          fetch('/api/records/vaccine' + (petId ? `?petId=${petId}` : '')).then(r => r.json()),
          fetch('/api/records/weight' + (petId ? `?petId=${petId}` : '')).then(r => r.json()),
        ])

        recordsData = [
          ...deworming.map((r: any) => ({ ...r, type: 'deworming' as const })),
          ...internal.map((r: any) => ({ ...r, type: 'internal' as const })),
          ...bathing.map((r: any) => ({ ...r, type: 'bathing' as const })),
          ...vaccine.map((r: any) => ({ ...r, type: 'vaccine' as const })),
          ...weight.map((r: any) => ({ ...r, type: 'weight' as const })),
        ]
      } else {
        const response = await fetch(`/api/records/${type}` + (petId ? `?petId=${petId}` : ''))
        if (response.ok) {
          const data = await response.json()
          recordsData = data.map((r: any) => ({ ...r, type: type as any }))
        }
      }

      recordsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setRecords(recordsData)
    } catch (error) {
      console.error('Error fetching records:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">健康记录</h1>
            <p className="text-gray-600">管理宠物的健康护理记录</p>
          </div>
          <Link
            href="/records/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="h-5 w-5" />
            添加记录
          </Link>
        </div>

        {/* 筛选器 */}
        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700">筛选条件</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 宠物筛选 */}
            <div>
              <label htmlFor="pet" className="block text-sm font-medium text-gray-700 mb-2">
                宠物
              </label>
              <select
                id="pet"
                value={petId || ''}
                onChange={(e) => {
                  const url = new URL(window.location.href)
                  if (e.target.value) {
                    url.searchParams.set('petId', e.target.value)
                  } else {
                    url.searchParams.delete('petId')
                  }
                  window.location.href = url.toString()
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">全部宠物</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 类型筛选 */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                记录类型
              </label>
              <select
                id="type"
                value={type || 'all'}
                onChange={(e) => {
                  const url = new URL(window.location.href)
                  url.searchParams.set('type', e.target.value)
                  window.location.href = url.toString()
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">全部类型</option>
                <option value="deworming">外驱</option>
                <option value="internal">内驱</option>
                <option value="bathing">洗澡</option>
                <option value="vaccine">疫苗</option>
                <option value="weight">体重</option>
              </select>
            </div>
          </div>
        </div>

        {/* 记录列表 */}
        {records.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-12 text-center">
            <p className="text-gray-600 mb-6">没有找到符合条件的记录</p>
            <Link
              href="/records/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              <Plus className="h-5 w-5" />
              添加第一条记录
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="bg-white rounded-lg shadow-sm border border-pink-100 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <Link
                    href={`/pets/${record.pet.id}`}
                    className="text-sm font-medium text-pink-600 hover:text-pink-700"
                  >
                    {record.pet.name}
                  </Link>
                  <span className="text-xs text-gray-500">
                    {new Date(record.date).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <RecordCard record={record} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default function RecordsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <RecordsContent />
    </Suspense>
  )
}
