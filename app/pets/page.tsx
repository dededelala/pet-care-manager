'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import PetCard from '@/components/PetCard'
import Link from 'next/link'
import { Plus, Heart } from 'lucide-react'

export default function PetsPage() {
  const [pets, setPets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">我的宠物</h1>
            <p className="text-gray-600">管理您的宠物信息和健康档案</p>
          </div>
          <Link
            href="/pets/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="h-5 w-5" />
            添加宠物
          </Link>
        </div>

        {/* 宠物列表 */}
        {pets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              还没有添加任何宠物
            </h3>
            <p className="text-gray-600 mb-6">
              开始添加您的第一只宠物，记录它的健康信息
            </p>
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
    </main>
  )
}
