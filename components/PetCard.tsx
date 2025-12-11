import Link from 'next/link'
import { Calendar, MapPin } from 'lucide-react'
import { Pet } from '@prisma/client'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface PetCardProps {
  pet: Pet
}

export default function PetCard({ pet }: PetCardProps) {
  const getDaysOld = () => {
    if (!pet.birthday) return null
    const today = new Date()
    const birthDate = new Date(pet.birthday)
    const diffTime = Math.abs(today.getTime() - birthDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysOld = getDaysOld()

  return (
    <Link href={`/pets/${pet.id}`}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-pink-100 hover:border-pink-200 group cursor-pointer">
        <div className="flex items-start gap-4">
          {/* 宠物头像 */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {pet.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pet.photo}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl">{pet.name.charAt(0)}</span>
            )}
          </div>

          {/* 宠物信息 */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
              {pet.name}
            </h3>

            <div className="mt-2 space-y-1">
              {pet.breed && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">品种：</span>
                  {pet.breed}
                </p>
              )}

              {pet.gender && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">性别：</span>
                  {pet.gender}
                </p>
              )}

              {pet.color && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">毛色：</span>
                  {pet.color}
                </p>
              )}

              {pet.birthday && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(pet.birthday), 'yyyy年MM月dd日', { locale: zhCN })}
                    {daysOld && ` · ${daysOld}天`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {pet.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 line-clamp-2">{pet.notes}</p>
          </div>
        )}
      </div>
    </Link>
  )
}
