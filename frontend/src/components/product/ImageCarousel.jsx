import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getProductImage } from '../../utils/images'

export function ImageCarousel({ images = [], productName = 'Product' }) {
  const [active, setActive] = useState(0)
  const imgs = images.length ? images : [getProductImage([])]

  const prev = () => setActive(i => (i - 1 + imgs.length) % imgs.length)
  const next = () => setActive(i => (i + 1) % imgs.length)

  return (
    <div className="flex flex-col gap-3">

      {/* Main Image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50">
        <img
          src={imgs[active]}
          alt={`${productName} – view ${active + 1}`}
          className="w-full h-full object-contain"
          loading="lazy"
          onError={(e) => { e.target.src = getProductImage([]) }}
        />

        {/* Left Arrow */}
        {imgs.length > 1 && (
          <button onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.45)', color: '#fff' }}>
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Right Arrow */}
        {imgs.length > 1 && (
          <button onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.45)', color: '#fff' }}>
            <ChevronRight size={20} />
          </button>
        )}

        {/* Dot indicators */}
        {imgs.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {imgs.map((_, i) => (
              <button key={i} onClick={() => setActive(i)}
                className="rounded-full transition-all duration-300"
                style={{ width: i === active ? 18 : 7, height: 7, background: i === active ? '#fff' : 'rgba(255,255,255,0.45)' }} />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imgs.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === active ? 'border-indigo-500' : 'border-gray-700'}`}>
              <img
                src={img}
                alt={`${productName} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { e.target.src = getProductImage([]) }}
              />
            </button>
          ))}
        </div>
      )}

    </div>
  )
}
