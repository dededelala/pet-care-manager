'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Mail, Clock, Trash2, Edit, Bell } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

type ReminderType = 'deworming' | 'internal_deworming' | 'vaccine' | 'bathing'

const REMINDER_TYPES = [
  { value: 'deworming', label: '外驱', icon: '🐛', color: 'blue' },
  { value: 'internal_deworming', label: '内驱', icon: '💊', color: 'blue' },
  { value: 'vaccine', label: '疫苗', icon: '💉', color: 'purple' },
  { value: 'bathing', label: '洗澡', icon: '🛁', color: 'green' },
] as const

export default function RemindersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const petId = searchParams.get('petId')

  const [pet, setPet] = useState<any>(null)
  const [reminders, setReminders] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingReminder, setEditingReminder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    type: 'deworming' as ReminderType,
    email: '',
    intervalDays: 30,
    isEnabled: true,
  })

  useEffect(() => {
    if (petId) {
      fetchData()
    }
  }, [petId])

  const fetchData = async () => {
    try {
      // 获取宠物信息
      const petResponse = await fetch('/api/pets')
      if (petResponse.ok) {
        const pets = await petResponse.json()
        const currentPet = pets.find((p: any) => p.id === petId)
        if (currentPet) {
          setPet(currentPet)
        }
      }

      // 获取提醒设置
      const remindersResponse = await fetch(`/api/reminders?petId=${petId}`)
      if (remindersResponse.ok) {
        const remindersData = await remindersResponse.json()
        setReminders(remindersData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingReminder
        ? `/api/reminders/${editingReminder.id}`
        : '/api/reminders'

      const method = editingReminder ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          petId,
        }),
      })

      if (response.ok) {
        await fetchData()
        setShowForm(false)
        setEditingReminder(null)
        setFormData({
          type: 'deworming',
          email: '',
          intervalDays: 30,
          isEnabled: true,
        })
      }
    } catch (error) {
      console.error('Error saving reminder:', error)
    }
  }

  const handleEdit = (reminder: any) => {
    setEditingReminder(reminder)
    setFormData({
      type: reminder.type,
      email: reminder.email,
      intervalDays: reminder.intervalDays,
      isEnabled: reminder.isEnabled,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个提醒吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting reminder:', error)
    }
  }

  const toggleReminder = async (reminder: any) => {
    try {
      const response = await fetch(`/api/reminders/${reminder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...reminder,
          isEnabled: !reminder.isEnabled,
        }),
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error toggling reminder:', error)
    }
  }

  const getTypeInfo = (type: ReminderType) => {
    return REMINDER_TYPES.find(t => t.value === type) || REMINDER_TYPES[0]
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮 */}
        <Link
          href={`/pets/${petId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          返回宠物详情
        </Link>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {pet.name} 的提醒设置
          </h1>
          <p className="text-gray-600">
            设置邮件提醒，及时关注宠物的健康护理
          </p>
        </div>

        {/* 添加提醒按钮 */}
        <div className="mb-6">
          <button
            onClick={() => {
              setEditingReminder(null)
              setFormData({
                type: 'deworming',
                email: '',
                intervalDays: 30,
                isEnabled: true,
              })
              setShowForm(true)
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
          >
            <Plus className="h-5 w-5" />
            添加提醒
          </button>
        </div>

        {/* 提醒表单 */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {editingReminder ? '编辑提醒' : '添加提醒'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 提醒类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  提醒类型
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {REMINDER_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        formData.type === type.value
                          ? `border-${type.color}-400 bg-${type.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{type.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 邮箱 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱地址
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              {/* 提醒周期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  提醒周期（天）
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="365"
                  value={formData.intervalDays}
                  onChange={(e) => setFormData({ ...formData, intervalDays: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="30"
                />
                <p className="text-sm text-gray-500 mt-1">
                  每隔多少天发送一次提醒邮件
                </p>
              </div>

              {/* 启用状态 */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isEnabled"
                  checked={formData.isEnabled}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <label htmlFor="isEnabled" className="text-sm font-medium text-gray-700">
                  启用此提醒
                </label>
              </div>

              {/* 按钮 */}
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
                >
                  {editingReminder ? '保存' : '添加'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingReminder(null)
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 提醒列表 */}
        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">现有提醒</h2>

          {reminders.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">还没有设置任何提醒</p>
              <p className="text-sm text-gray-500">
                点击"添加提醒"按钮为 {pet.name} 设置邮件提醒
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder) => {
                const typeInfo = getTypeInfo(reminder.type)
                return (
                  <div
                    key={reminder.id}
                    className={`border rounded-lg p-4 transition-all ${
                      reminder.isEnabled
                        ? 'border-gray-200 bg-white'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${typeInfo.color}-100`}>
                          <span className="text-2xl">{typeInfo.icon}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{typeInfo.label}提醒</h3>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                reminder.isEnabled
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {reminder.isEnabled ? '已启用' : '已禁用'}
                            </span>
                          </div>

                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{reminder.email}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                每 {reminder.intervalDays} 天提醒一次
                              </span>
                            </div>

                            {reminder.nextDueDate && (
                              <div className="text-xs text-gray-500 mt-2">
                                下次提醒：{format(new Date(reminder.nextDueDate), 'yyyy年MM月dd日', { locale: zhCN })}
                              </div>
                            )}

                            {reminder.lastSent && (
                              <div className="text-xs text-gray-500">
                                上次发送：{format(new Date(reminder.lastSent), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleReminder(reminder)}
                          className={`px-3 py-1 text-sm rounded-lg transition-all ${
                            reminder.isEnabled
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {reminder.isEnabled ? '禁用' : '启用'}
                        </button>

                        <button
                          onClick={() => handleEdit(reminder)}
                          className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(reminder.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 帮助信息 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 提醒说明</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• 系统会在到期日期前3天和到期当天发送提醒邮件</li>
            <li>• 邮件会发送到您设置的邮箱地址</li>
            <li>• 可以随时启用/禁用或修改提醒设置</li>
            <li>• 请确保邮箱地址正确，以免错过重要提醒</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
