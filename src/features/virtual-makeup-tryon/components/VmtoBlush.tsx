import { Reveal, PrimaryButton, VMTO_IMAGES } from './vmto-ui'

const features = [
  'Customizable blush patterns and various blush textures, including matte, satin, and shimmer for a complete virtual makeover.',
  'With precise virtual application corresponding to facial features and contours, the breakthrough leightweight face-analyzing and 3D rendering technology.',
  'The online makeover solution, powered by the AI makeup generator, is optimized for all ages, ethnicities, skin tones, and faces.',
]

export default function VmtoBlush() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Left: copy */}
        <Reveal>
          <h2
            className="font-black tracking-tight text-gray-900 text-2xl sm:text-3xl lg:text-[2.25rem]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Multi-Tone 3D Blush Virtual Try On
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            The new 3D blush makeup simulator allows users to experience virtual try-on
            with different tones across the face. Get a glow-up makeover and shop in just
            a few clicks.
          </p>

          <ul className="mt-6 space-y-4">
            {features.map((f) => (
              <li key={f} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-500" />
                <span className="text-sm leading-relaxed text-gray-600">{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <PrimaryButton>Try 3D Blush — Free Demo</PrimaryButton>
          </div>
        </Reveal>

        {/* Right: split tone portraits */}
        <Reveal delay={0.1}>
          <div className="relative overflow-hidden rounded-3xl shadow-card">
            <img
              src={VMTO_IMAGES.lookGrid}
              alt="Multi-tone blush try-on examples"
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center gap-2 p-4">
              {['#F2B5B5', '#E78F8F', '#C96A6A', '#A84B5B'].map((c) => (
                <span
                  key={c}
                  className="h-6 w-6 rounded-full border-2 border-white shadow"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
