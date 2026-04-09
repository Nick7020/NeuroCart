import { useState } from 'react'

export function ImageCarousel({ images = [] }) {
  const [active, setActive] = useState(0)
  const imgs = images.length ? images : ['https://placehold.co/600x600/1f2937/6366f1?text=Product']

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square rounded-2xl overflow-hidden bg-gray-800">
        <img src={imgs[active]} alt="product" className="w-full h-full object-cover" />
      </div>
      {imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === active ? 'border-indigo-500' : 'border-gray-700'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
