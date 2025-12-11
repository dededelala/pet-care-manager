'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import WeightChart from '@/components/WeightChart'
import Link from 'next/link'
import { BarChart3, ArrowLeft } from 'lucide-react'

export default function ChartsPage() {
  const [pets, setPets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // 获取所有宠物
      const petsResponse = await fetch('/api/pets')
      if (petsResponse.ok) {
        const petsData = await petsResponse.json()

        // 为每个宠物获取体重记录
        const petsWithWeightData = await Promise.all(
          petsData.map(async (pet: any) => {
            const weightResponse = await fetch(`/api/records/weight?petId=${pet.id}`)
            if (weightResponse.ok) {
              const weightRecords = await weightResponse.json()
              return { ...pet, weightRecords }
            }
            return { ...pet, weightRecords: [] }
          })
        )

        // 筛选出有体重数据的宠物
        const filteredPets = petsWithWeightData.filter((pet) => pet.weightRecords.length > 0)
        setPets(filteredPets)
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
        {/* 返回按钮 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          返回首页
        </Link>

        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-8 w-8 text-pink-500" />
            <h1 className="text-3xl font-bold text-gray-900">数据可视化</h1>
          </div>
          <p className="text-gray-600">查看宠物的健康数据趋势</p>
        </div>

        {pets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-12 text-center">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              还没有体重数据
            </h3>
            <p className="text-gray-600 mb-6">
              添加体重记录后即可查看趋势图表
            </p>
            <Link
              href="/records/new?type=weight"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              添加体重记录
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {pets.map((pet) => (
              <div key={pet.id}>
                <WeightChart
                  records={pet.weightRecords}
                  petName={pet.name}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
