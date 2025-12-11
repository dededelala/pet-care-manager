import { format, isAfter, isBefore, addDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { AlertCircle, Calendar } from 'lucide-react'
import {
  DewormingRecord,
  InternalDewormingRecord,
  BathingRecord,
  VaccineRecord,
  WeightRecord,
} from '@prisma/client'

type RecordType =
  | DewormingRecord
  | InternalDewormingRecord
  | BathingRecord
  | VaccineRecord
  | WeightRecord

interface RecordCardProps {
  record: RecordType & { type: 'deworming' | 'internal' | 'bathing' | 'vaccine' | 'weight' }
}

export default function RecordCard({ record }: RecordCardProps) {
  const getRecordInfo = () => {
    const date = format(new Date(record.date), 'yyyy年MM月dd日', { locale: zhCN })

    switch (record.type) {
      case 'deworming':
      case 'internal':
        return {
          icon: '🐛',
          title: (record as any).brand,
          subtitle: `剂量：${(record as any).dosage}`,
          date,
          dueDate: (record as any).nextDueDate,
          notes: record.notes,
        }
      case 'bathing':
        return {
          icon: '🛁',
          title: (record as any).products || '洗澡',
          subtitle: (record as any).location || '',
          date,
          dueDate: null,
          notes: record.notes,
        }
      case 'vaccine':
        return {
          icon: '💉',
          title: (record as any).type,
          subtitle: (record as any).institution || '',
          date,
          dueDate: (record as any).nextDueDate,
          notes: record.notes,
        }
      case 'weight':
        return {
          icon: '⚖️',
          title: `${(record as any).weight}${(record as any).unit}`,
          subtitle: (record as any).location || '',
          date,
          dueDate: null,
          notes: record.notes,
        }
      default:
        return {
          icon: '📝',
          title: '',
          subtitle: '',
          date,
          dueDate: null,
          notes: record.notes,
        }
    }
  }

  const info = getRecordInfo()
  const isExpiringSoon = info.dueDate && isAfter(new Date(), addDays(new Date(info.dueDate), -7))

  return (
    <div className="bg-white rounded-lg shadow-sm border border-pink-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl">{info.icon}</span>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900">{info.title}</h4>
            {info.subtitle && (
              <p className="text-sm text-gray-600 mt-1">{info.subtitle}</p>
            )}
            <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{info.date}</span>
            </div>

            {info.dueDate && (
              <div
                className={`flex items-center gap-1 mt-2 text-sm ${
                  isExpiringSoon ? 'text-orange-600' : 'text-gray-500'
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                <span>
                  下次{' '}
                  {format(new Date(info.dueDate), 'yyyy年MM月dd日', { locale: zhCN })}
                </span>
              </div>
            )}

            {info.notes && (
              <p className="text-sm text-gray-600 mt-2">{info.notes}</p>
            )}
          </div>
        </div>

        {isExpiringSoon && (
          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full whitespace-nowrap">
            即将到期
          </span>
        )}
      </div>
    </div>
  )
}
