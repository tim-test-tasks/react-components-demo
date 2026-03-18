import {Swiper, SwiperRef, SwiperSlide} from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import './AgesSlider.scss'
import ArrowIcon from '../../assets/ArrowIcon'

import gsap from 'gsap'

import {generateAges, type AgesInterval, type EventsData} from '../../shared/mock/generateAges'

import {useCallback, useEffect, useRef, useState} from 'react'
import { Pagination } from 'swiper/modules'

const mockData: AgesInterval[] = generateAges()

const AgesSlider = () => {
  const [activePeriodIndex, setActivePeriodIndex] = useState(0)
  const [isCircleAnimating, setIsCircleAnimating] = useState(false)

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className='container'>
      <div className='item'>
        <div className='title'>
          Исторические <br />
          даты
        </div>
        <CircularSlider
          activeIndex={activePeriodIndex}
          onChange={setActivePeriodIndex}
          onAnimateStateChange={setIsCircleAnimating}
          isCircleAnimating={isCircleAnimating}
        />
        <EventsSlider events={mockData[activePeriodIndex].events} isCircleAnimating={isCircleAnimating} />
      </div>
    </div>
  )
}

type CircularSliderProps = {
  activeIndex: number
  onChange: (index: number) => void
  onAnimateStateChange: (isAnimating: boolean) => void
  isCircleAnimating: boolean
}

const CircularSlider = ({activeIndex, onChange, onAnimateStateChange, isCircleAnimating}: CircularSliderProps) => {
  const swiperRef = useRef<SwiperRef>(null)

  const totalSlides = mockData.length
  const dotWrapperRefs = useRef<(HTMLDivElement | null)[]>([])

  const dotAnglesRef = useRef<number[]>([])

  const [fromYear, setFromYear] = useState(mockData[0].from)
  const [toYear, setToYear] = useState(mockData[0].to)

  const lastTargetRef = useRef({
    from: mockData[0].from,
    to: mockData[0].to
  })

  /* ---------------- YEARS ---------------- */

  const animateYears = useCallback(
    (newIndex: number) => {
      const nextInterval = mockData[newIndex]

      const state = {
        from: lastTargetRef.current.from,
        to: lastTargetRef.current.to
      }

      onAnimateStateChange(true)

      gsap.to(state, {
        from: nextInterval.from,
        to: nextInterval.to,
        duration: 0.6,
        ease: 'none',
        onUpdate: () => {
          setFromYear(Math.round(state.from))
          setToYear(Math.round(state.to))
        },
        onComplete: () => {
          lastTargetRef.current = {
            from: nextInterval.from,
            to: nextInterval.to
          }
          onAnimateStateChange(false)
        }
      })
    },
    [onAnimateStateChange]
  )

  /* ---------------- CIRCLE GEOMETRY ---------------- */

  const CIRCLE_RADIUS = 180
  const START_ANGLE = -60

  const getAngleByIndex = (index: number) => START_ANGLE + (360 / totalSlides) * index

  const angleToXY = (angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180
    return {
      x: CIRCLE_RADIUS * Math.cos(rad),
      y: CIRCLE_RADIUS * Math.sin(rad)
    }
  }

  /* ---------------- DOTS ---------------- */

  const setDotsInstant = (activeIdx: number) => {
    dotWrapperRefs.current.forEach((wrapper, idx) => {
      if (!wrapper) return

      const shiftedIndex = (idx - activeIdx + totalSlides) % totalSlides
      const angle = getAngleByIndex(shiftedIndex)

      dotAnglesRef.current[idx] = angle

      const {x, y} = angleToXY(angle)
      gsap.set(wrapper, {x, y})
    })
  }

  const animateDots = (activeIdx: number) => {
    dotWrapperRefs.current.forEach((wrapper, idx) => {
      if (!wrapper) return

      const currentAngle = dotAnglesRef.current[idx]
      const targetAngle = getAngleByIndex(idx - activeIdx + totalSlides)

      let delta = ((targetAngle - currentAngle + 540) % 360) - 180

      const angleObj = {angle: currentAngle}

      gsap.to(angleObj, {
        angle: currentAngle + delta,
        duration: 0.8,
        ease: 'power2.inOut',
        onUpdate: () => {
          const {x, y} = angleToXY(angleObj.angle)
          wrapper.style.transform = `translate(${x}px, ${y}px)`
          dotAnglesRef.current[idx] = angleObj.angle
        }
      })
    })
  }

  /* ---------------- HANDLERS ---------------- */

  const handlePrev = () => swiperRef.current?.swiper?.slidePrev()
  const handleNext = () => swiperRef.current?.swiper?.slideNext()

  const handleDotClick = (index: number) => {
    swiperRef.current?.swiper?.slideTo(index)
  }

  const handleSlideChange = useCallback(() => {
    const swiper = swiperRef.current?.swiper
    if (!swiper) return

    const newIndex = swiper.activeIndex

    onChange(newIndex)
    animateYears(newIndex)
    animateDots(newIndex)
  }, [onChange])

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    setDotsInstant(activeIndex)
  }, [])

  useEffect(() => {
    const swiper = swiperRef.current?.swiper
    if (!swiper) return

    swiper.on('slideChange', handleSlideChange)
    return () => swiper.off('slideChange', handleSlideChange)
  }, [handleSlideChange])

  /* ---------------- RENDER ---------------- */

  return (
    <div className='circle-slider'>
      <div className='circle-slider__controls'>
        <div className='circle-slider__counter'>
          {String(activeIndex + 1).padStart(2, '0')}/{String(totalSlides).padStart(2, '0')}
        </div>

        <div className='circle-slider__buttons'>
          <button className='circle-slider__prev-btn' onClick={handlePrev}>
            <ArrowIcon direction='left' />
          </button>
          <button className='circle-slider__next-btn' onClick={handleNext}>
            <ArrowIcon direction='right' />
          </button>
        </div>
      </div>

      <div className='circle-slider__circle'>
        <div className='circle-slider__dots'>
          {mockData.map((_, idx) => (
            <div
              key={idx}
              ref={el => {
                dotWrapperRefs.current[idx] = el
              }}
              className='circle-slider__dot-wrapper'
            >
              <button
                className={`circle-slider__dot ${idx === activeIndex ? 'circle-slider__dot--active' : ''}`}
                onClick={() => handleDotClick(idx)}
              >
                {idx + 1}
              </button>
              {idx === activeIndex && (
                <div className={`circle-slider__dot-label ${isCircleAnimating ? 'hidden' : 'visible'}`}>
                  {mockData[activeIndex].titleAges}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Swiper ref={swiperRef} slidesPerView={1} speed={0} allowTouchMove={false} className='circle-slider__swiper'>
        {mockData.map((_, idx) => (
          <SwiperSlide key={idx}>
            <div className='circle-slider__age-interval'>
              <span>{fromYear}</span>
              <span> </span>
              <span>{toYear}</span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

type EventsSliderProps = {
  events: EventsData[]
  isCircleAnimating: boolean
}

const EventsSlider = ({events, isCircleAnimating}: EventsSliderProps) => {
  const swiperRef = useRef<SwiperRef>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const prevBtnRef = useRef<HTMLButtonElement>(null)
  const nextBtnRef = useRef<HTMLButtonElement>(null)

  const handlePrev = useCallback(() => {
    swiperRef.current?.swiper?.slidePrev()
  }, [])

  const handleNext = useCallback(() => {
    swiperRef.current?.swiper?.slideNext()
  }, [])

  const handleSlideChange = useCallback(() => {
    const swiper = swiperRef.current?.swiper
    if (!swiper || !prevBtnRef.current || !nextBtnRef.current) return

    prevBtnRef.current.style.opacity = swiper.activeIndex === 0 ? '0' : '1'
    nextBtnRef.current.style.opacity = swiper.isEnd ? '0' : '1'
  }, [])

  useEffect(() => {
    const swiper = swiperRef.current?.swiper
    if (swiper) {
      swiper.on('slideChange', handleSlideChange)
      handleSlideChange()
      return () => swiper.off('slideChange', handleSlideChange)
    }
  }, [handleSlideChange])

  useEffect(() => {
    swiperRef.current?.swiper?.slideTo(0)
  }, [events])

  useEffect(() => {
    if (!wrapperRef.current) return

    if (isCircleAnimating) {
      gsap.to(wrapperRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
        pointerEvents: 'none'
      })
    } else {
      gsap.to(wrapperRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.in',
        pointerEvents: 'auto'
      })
    }
  }, [isCircleAnimating])

  return (
    <div className='events-slider' ref={wrapperRef}>
      <div className='events-slider__buttons'>
        <button
          ref={prevBtnRef}
          className='events-slider__prev-btn'
          onClick={handlePrev}
          aria-label='Предыдущее событие'
        >
          <ArrowIcon direction='left' />
        </button>
        <button
          ref={nextBtnRef}
          className='events-slider__next-btn'
          onClick={handleNext}
          aria-label='Следующее событие'
        >
          <ArrowIcon direction='right' />
        </button>
      </div>

      <Swiper
        ref={swiperRef}
        spaceBetween={40}
        slidesPerView={'auto'}
        className='events-slider__swiper'
        watchSlidesProgress={true}
        modules={[Pagination]}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          dynamicMainBullets: 3
        }}
      >
        {events.map((el, idx) => (
          <SwiperSlide key={idx}>
            <EventSlide element={el} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

type EventSlideProps = {element: EventsData}

const EventSlide = ({element}: EventSlideProps) => {
  return (
    <div className='events-slider__slide'>
      <span className='events-slider__slide-title'>{element.titleYear}</span>
      <p className='events-slider__slide-desc'>{element.desc}</p>
    </div>
  )
}

export default AgesSlider
