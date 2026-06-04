import { Reveal, PinkBtn } from './nail-ui'

export default function NailCTA() {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <Reveal>
          <h2
            className="font-black text-gray-900"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
            }}
          >
            Let's Build Your Success Story Together
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <PinkBtn>Free Product Demo</PinkBtn>
            <PinkBtn outline>How Sally Hansen Increased Sales</PinkBtn>
          </div>
        </Reveal>
      </div>
    </section>
  )
}