import React, {useState, useRef, useEffect, useCallback} from 'react'
import {Chip, ChipProps} from './Chip'
import * as styles from './ChipList.module.scss'

import {Ellipsis} from 'lucide-react'

export interface ChipItem extends Omit<ChipProps, 'onClick' | 'selected'> {
  id: string | number
}

export interface ChipListProps {
  /** Массив чипсов */
  items: ChipItem[]
  /** Выбранные чипсы (для контролируемого режима) */
  selectedIds?: (string | number)[]
  /** Режим множественного выбора */
  multiple?: boolean
  /** Обработчик изменения выбора */
  onChange?: (selectedIds: (string | number)[]) => void
  /** Дополнительный класс */
  className?: string
  /** Максимальная ширина контейнера */
  maxWidth?: string | number
  /** Текст для кнопки "еще" */
  moreText?: string
  /** Компонент для попапа (по умолчанию используем нативный select) */
  popupComponent?: React.ComponentType<PopupProps>
}

export interface PopupProps {
  /** Скрытые чипсы */
  items: ChipItem[]
  /** Выбранные ID */
  selectedIds: (string | number)[]
  /** Обработчик выбора */
  onSelect: (id: string | number) => void
  /** Открыт ли попап */
  isOpen: boolean
  /** Закрыть попап */
  onClose: () => void
  /** Элемент, к которому привязан попап */
  anchorEl: HTMLElement | null
  /** Один или несколько выбранных элементов внутри попапа */
  multiple?: boolean
}

// Стандартный попап (можно заменить на любой другой)
// Стандартный попап с чипсами
const DefaultPopup: React.FC<PopupProps> = ({items, selectedIds, onSelect, isOpen, onClose, anchorEl, multiple}) => {
  const popupRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({top: 0, left: 0})
  const [popupWidth, setPopupWidth] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen && anchorEl) {
      const rect = anchorEl.getBoundingClientRect()

      // Получаем ширину контейнера с видимыми чипсами
      const chipListContainer = anchorEl.closest(`.${styles.chipList}`)?.querySelector(`.${styles.chipListContainer}`)
      let width = 300 // значение по умолчанию

      if (chipListContainer) {
        // Ширина попапа - половина ширины контейнера с чипсами
        width = chipListContainer.clientWidth / 2
      }

      setPopupWidth(Math.max(250, Math.min(600, width)))

      setPosition({
        top: rect.height + 8,
        left: Math.max(0, rect.width / 2 - width / 2) // Центрируем относительно кнопки
      })
    }
  }, [isOpen, anchorEl])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const path = event.composedPath()

      const isInsidePopup = path.includes(popupRef.current as EventTarget)
      const isInsideButton = path.includes(anchorEl as EventTarget)

      if (!isInsidePopup && !isInsideButton) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('pointerdown', handlePointerDown, true)
    }

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
    }
  }, [isOpen, onClose, anchorEl])

  if (!isOpen || !anchorEl) return null

  return (
    <div
      ref={popupRef}
      className={styles.popup}
      style={{
        top: position.top,
        left: position.left,
        width: popupWidth ? `${popupWidth}px` : 'auto'
      }}
    >
      <div className={styles.popupContent}>
        {items.map(item => (
          <div
            key={item.id}
            className={styles.popupChipWrapper}
            onClick={() => {
              onSelect(item.id)
              // if (!multiple) {
              //   onClose()
              // }
            }}
          >
            <Chip
              {...item}
              selected={selectedIds.includes(item.id)}
              // Отключаем onClick из пропсов, чтобы не конфликтовал
              onClick={() => {}}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export const ChipList: React.FC<ChipListProps> = ({
  items,
  selectedIds: controlledSelectedIds,
  multiple = false,
  onChange,
  className = '',
  maxWidth = '100%',
  moreText = '...',
  popupComponent: Popup = DefaultPopup
}) => {
  const [internalSelectedIds, setInternalSelectedIds] = useState<(string | number)[]>(controlledSelectedIds || [])
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(items.length)
  const containerRef = useRef<HTMLDivElement>(null)
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  const selectedIds = controlledSelectedIds ?? internalSelectedIds

  // Обработка выбора
  const handleSelect = useCallback(
    (id: string | number) => {
      let newSelectedIds: (string | number)[]

      if (multiple) {
        if (selectedIds.includes(id)) {
          newSelectedIds = selectedIds.filter(selectedId => selectedId !== id)
        } else {
          newSelectedIds = [...selectedIds, id]
        }
      } else {
        newSelectedIds = selectedIds.includes(id) ? [] : [id]
      }

      if (!controlledSelectedIds) {
        setInternalSelectedIds(newSelectedIds)
      }
      onChange?.(newSelectedIds)
    },
    [selectedIds, multiple, controlledSelectedIds, onChange]
  )

  // Расчет видимых элементов
  const calculateVisibleCount = useCallback(() => {
    if (!containerRef.current) return

    const containerWidth = containerRef.current.offsetWidth
    const moreButtonWidth = moreButtonRef.current?.offsetWidth || 0

    // Получаем gap из computed styles
    const gap = parseFloat(getComputedStyle(containerRef.current).gap) || 16

    let totalWidth = 0
    let count = 0

    for (let i = 0; i < items.length; i++) {
      const item = itemsRef.current[i]
      if (item) {
        const itemWidth = item.offsetWidth
        const margin = i > 0 ? gap : 0

        if (totalWidth + margin + itemWidth + moreButtonWidth <= containerWidth) {
          totalWidth += margin + itemWidth
          count++
        } else {
          break
        }
      }
    }

    setVisibleCount(count)
  }, [items.length])

  // Отслеживание изменения размеров
  useEffect(() => {
    calculateVisibleCount()

    const resizeObserver = new ResizeObserver(() => {
      calculateVisibleCount()
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [calculateVisibleCount])

  // Обновление при изменении items
  useEffect(() => {
    calculateVisibleCount()
  }, [items, calculateVisibleCount])

  const visibleItems = items.slice(0, visibleCount)
  const hiddenItems = items.slice(visibleCount)

  return (
    <div ref={containerRef} className={`${styles.chipList} ${className}`} style={{maxWidth}}>
      <div className={styles.chipListContainer}>
        {visibleItems.map((item, index) => (
          <div
            key={item.id}
            ref={el => {
              itemsRef.current[index] = el
            }}
            className={styles.chipWrapper}
          >
            <Chip {...item} selected={selectedIds.includes(item.id)} onClick={handleSelect} />
          </div>
        ))}
      </div>

      {hiddenItems.length > 0 && (
        <div className={styles.moreButtonWrapper}>
          <button
            ref={moreButtonRef}
            className={styles.moreButton}
            onClick={e => {
              e.stopPropagation()
              setIsPopupOpen(prev => !prev)
            }}
          >
            {/* +{hiddenItems.length} {moreText} */}
            <Ellipsis size={20} />
          </button>
        </div>
      )}

      <Popup
        items={hiddenItems}
        selectedIds={selectedIds}
        onSelect={handleSelect}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        anchorEl={moreButtonRef.current}
        multiple={multiple}
      />
    </div>
  )
}
