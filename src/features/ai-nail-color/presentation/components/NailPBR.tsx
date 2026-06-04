import { Reveal, SectionHeading, ArrowLink } from './nail-ui'

export default function NailPBR() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <Reveal delay={0.1}>
          <SectionHeading
            eyebrow="Advanced Rendering"
            title="Realistic AR Enhanced by Physically Based Rendering (PBR)"
          />
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            Highly-realistic textures, reflections, finishes and lighting simulations deliver
            top-class AR effects for the most realistic nail virtual try-on experience.
          </p>
          <p className="mt-3 text-base leading-relaxed text-gray-600">
            Taking advantage of physically based rendering (PBR), our AR nails present
            digital nail art renderings with unmatched accuracy.
          </p>
          <div className="mt-6">
            <ArrowLink>Learn More From Our Experts</ArrowLink>
          </div>
        </Reveal>

        <Reveal>
          <div className="overflow-hidden rounded-2xl shadow-xl">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster="https://bcw-media.s3.ap-northeast-1.amazonaws.com/nails_s4_poster_dt_a7146b0c16.jpg"
              className="w-full object-cover"
            >
              <source
                src="https://bcw-media.s3.ap-northeast-1.amazonaws.com/nails_s4_video_400e243ca0.mp4"
                type="video/mp4"
              />
            </video>
          </div>
        </Reveal>
      </div>
    </section>
  )
}