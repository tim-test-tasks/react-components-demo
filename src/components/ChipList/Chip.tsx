import React from 'react'
import * as styles from './Chip.module.scss'

import {X} from 'lucide-react'

export interface ChipProps {
  /** Уникальный идентификатор чипса */
  id: string | number
  /** Текст чипса */
  label: string
  /** Выбран ли чипс */
  selected?: boolean
  /** Дополнительные CSS классы */
  className?: string
  /** Обработчик клика */
  onClick?: (id: string | number) => void
  /** Отключен ли чипс */
  disabled?: boolean
  /** Иконка перед текстом */
  icon?: React.ReactNode
  /** Возможность удаления чипса */
  onDelete?: (id: string | number) => void
}

export const Chip: React.FC<ChipProps> = ({
  id,
  label,
  selected = false,
  className = '',
  onClick,
  disabled = false,
  icon,
  onDelete
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(id)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!disabled && onDelete) {
      onDelete(id)
    }
  }

  const chipClasses = [styles.chip, selected && styles.selected, disabled && styles.disabled, className]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={chipClasses}
      onClick={handleClick}
      role='button'
      tabIndex={disabled ? -1 : 0}
      aria-pressed={selected}
      aria-disabled={disabled}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{label}</span>
      {onDelete && (
        <button
          className={styles.deleteButton}
          onClick={handleDelete}
          aria-label={`Remove ${label}`}
          disabled={disabled}
        >
          <X />
        </button>
      )}
    </div>
  )
}
