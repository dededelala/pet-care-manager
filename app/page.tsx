'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import PetCard from '@/components/PetCard'
import Link from 'next/link'
import { Plus, Heart, Calendar, AlertCircle } from 'lucide-react'

export default function Home() {
  const [pets, setPets] = useState<any[]>([])
  const [upcomingRecords, setUpcomingRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // 获取宠物列表
      const petsResponse = await fetch('/api/pets')
      if (petsResponse.ok) {
        const petsData = await petsResponse.json()
        setPets(petsData.slice(0, 6))
      }

      // 获取即将到期的记录
      const recordsResponse = await fetch('/api/records/vaccine')
      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json()
        const upcoming = recordsData.filter((record: any) => {
          if (!record.nextDueDate) return false
          const dueDate = new Date(record.nextDueDate)
          const now = new Date()
          const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          return dueDate <= sevenDaysFromNow && dueDate >= now
        })
        setUpcomingRecords(upcoming)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 欢迎区域 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            欢迎使用宠物健康管家
          </h1>
          <p className="text-gray-600">
            专业的宠物健康护理记录与管理平台，让爱宠健康成长
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">我的宠物</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{pets.length}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">本月记录</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">即将到期</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {upcomingRecords.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 即将到期的记录 */}
        {upcomingRecords.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">即将到期的疫苗</h2>
              <Link
                href="/records"
                className="text-sm text-pink-600 hover:text-pink-700 font-medium"
              >
                查看全部
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{record.pet.name}</p>
                    <p className="text-sm text-gray-600">{record.type}</p>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium bg-orange-100 text-orange-700 rounded-full">
                    {new Date(record.nextDueDate!).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 我的宠物 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">我的宠物</h2>
            <Link
              href="/pets"
              className="text-sm text-pink-600 hover:text-pink-700 font-medium"
            >
              查看全部
            </Link>
          </div>

          {pets.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-12 text-center">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">还没有添加任何宠物</p>
              <Link
                href="/pets/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                <Plus className="h-5 w-5" />
                添加我的第一只宠物
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          )}
        </div>

        {/* 快速操作 */}
        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">快速操作</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/pets/new"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-pink-200 hover:border-pink-400 hover:bg-pink-50 transition-all text-center"
            >
              <Plus className="h-8 w-8 text-pink-500" />
              <span className="text-sm font-medium text-gray-700">添加宠物</span>
            </Link>

            <Link
              href="/records/new?type=deworming"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center"
            >
              <span className="text-2xl">🐛</span>
              <span className="text-sm font-medium text-gray-700">外驱记录</span>
            </Link>

            <Link
              href="/records/new?type=vaccine"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-green-200 hover:border-green-400 hover:bg-green-50 transition-all text-center"
            >
              <span className="text-2xl">💉</span>
              <span className="text-sm font-medium text-gray-700">疫苗记录</span>
            </Link>

            <Link
              href="/records/new?type=weight"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-center"
            >
              <span className="text-2xl">⚖️</span>
              <span className="text-sm font-medium text-gray-700">体重记录</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
