'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import RecordCard from '@/components/RecordCard'
import Link from 'next/link'
import { Calendar, ArrowLeft, Edit } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default function PetPage() {
  const params = useParams()
  const id = params.id as string
  const [pet, setPet] = useState<any>(null)
  const [allRecords, setAllRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchPetData()
    }
  }, [id])

  const fetchPetData = async () => {
    try {
      // 获取宠物信息
      const petResponse = await fetch('/api/pets')
      if (petResponse.ok) {
        const pets = await petResponse.json()
        const currentPet = pets.find((p: any) => p.id === id)
        if (currentPet) {
          setPet(currentPet)

          // 获取所有类型的记录
          const [deworming, internal, bathing, vaccine, weight] = await Promise.all([
            fetch(`/api/records/deworming?petId=${id}`).then(r => r.json()),
            fetch(`/api/records/internal?petId=${id}`).then(r => r.json()),
            fetch(`/api/records/bathing?petId=${id}`).then(r => r.json()),
            fetch(`/api/records/vaccine?petId=${id}`).then(r => r.json()),
            fetch(`/api/records/weight?petId=${id}`).then(r => r.json()),
          ])

          const records = [
            ...deworming.map((r: any) => ({ ...r, type: 'deworming' as const })),
            ...internal.map((r: any) => ({ ...r, type: 'internal' as const })),
            ...bathing.map((r: any) => ({ ...r, type: 'bathing' as const })),
            ...vaccine.map((r: any) => ({ ...r, type: 'vaccine' as const })),
            ...weight.map((r: any) => ({ ...r, type: 'weight' as const })),
          ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

          setAllRecords(records)
        }
      }
    } catch (error) {
      console.error('Error fetching pet data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600">加载中...</div>
        </div>
      </main>
    )
  }

  if (!pet) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600">宠物不存在</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮 */}
        <Link
          href="/pets"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          返回宠物列表
        </Link>

        {/* 宠物信息卡片 */}
        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-8 mb-8">
          <div className="flex items-start gap-8">
            {/* 宠物头像 */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {pet.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pet.photo}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-6xl">{pet.name.charAt(0)}</span>
              )}
            </div>

            {/* 宠物信息 */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
                <button className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                  <Edit className="h-5 w-5" />
                  编辑
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pet.breed && (
                  <div>
                    <p className="text-sm text-gray-600">品种</p>
                    <p className="font-medium text-gray-900">{pet.breed}</p>
                  </div>
                )}

                {pet.gender && (
                  <div>
                    <p className="text-sm text-gray-600">性别</p>
                    <p className="font-medium text-gray-900">{pet.gender}</p>
                  </div>
                )}

                {pet.color && (
                  <div>
                    <p className="text-sm text-gray-600">毛色</p>
                    <p className="font-medium text-gray-900">{pet.color}</p>
                  </div>
                )}

                {pet.birthday && (
                  <div>
                    <p className="text-sm text-gray-600">生日</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <p className="font-medium text-gray-900">
                        {format(new Date(pet.birthday), 'yyyy年MM月dd日', { locale: zhCN })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {pet.notes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">备注</p>
                  <p className="text-gray-700">{pet.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 最近记录 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">最近记录</h2>
            <Link
              href={`/records?petId=${pet.id}`}
              className="text-sm text-pink-600 hover:text-pink-700 font-medium"
            >
              查看全部记录
            </Link>
          </div>

          {allRecords.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-12 text-center">
              <p className="text-gray-600 mb-6">还没有任何健康记录</p>
              <Link
                href={`/records/new?petId=${pet.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                添加第一条记录
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {allRecords.slice(0, 10).map((record) => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>
          )}
        </div>

        {/* 快速操作 */}
        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">添加记录</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link
              href={`/records/new?petId=${pet.id}&type=deworming`}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center"
            >
              <span className="text-2xl">🐛</span>
              <span className="text-sm font-medium text-gray-700">外驱</span>
            </Link>

            <Link
              href={`/records/new?petId=${pet.id}&type=internal`}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center"
            >
              <span className="text-2xl">💊</span>
              <span className="text-sm font-medium text-gray-700">内驱</span>
            </Link>

            <Link
              href={`/records/new?petId=${pet.id}&type=bathing`}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-green-200 hover:border-green-400 hover:bg-green-50 transition-all text-center"
            >
              <span className="text-2xl">🛁</span>
              <span className="text-sm font-medium text-gray-700">洗澡</span>
            </Link>

            <Link
              href={`/records/new?petId=${pet.id}&type=vaccine`}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-center"
            >
              <span className="text-2xl">💉</span>
              <span className="text-sm font-medium text-gray-700">疫苗</span>
            </Link>

            <Link
              href={`/records/new?petId=${pet.id}&type=weight`}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all text-center"
            >
              <span className="text-2xl">⚖️</span>
              <span className="text-sm font-medium text-gray-700">体重</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
