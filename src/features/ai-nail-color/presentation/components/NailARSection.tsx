import { Reveal, SectionHeading } from './nail-ui'

export default function NailARSection() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-2xl shadow-xl"
            style={{
                backgroundImage: `url('https://bcw-media.s3.ap-northeast-1.amazonaws.com/nails_s1_poster_dt_491725c150.jpeg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                aspectRatio: '4/3',
            }}
            >
            {/* CTA overlay — center right */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 flex flex-col items-center justify-center gap-3">
                <img
                src="https://bcw-media.s3.ap-northeast-1.amazonaws.com/nails_s1_icon_3b6e5181a7.svg"
                alt="AI Virtual Nails"
                className="h-16 w-16"
                />
                <p className="text-base font-semibold text-white drop-shadow">AI Virtual Nails</p>
                <a
                href="/business/showcase/nail-color"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand-paper0 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:bg-brand-accent"
                >
                <img
                    src="https://d3ss46vukfdtpo.cloudfront.net/static/media/btn_camera.0c6509a0.svg"
                    alt=""
                    className="h-4 w-4"
                />
                Try On Now
                </a>
            </div>
            </div>
        </Reveal>

        <Reveal delay={0.1}>
          <SectionHeading
            eyebrow="True-to-Life Experience"
            title="True-to-Life AR Nail Try On Experience"
          />
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            Revolutionize the shopping journey for <strong>nail art</strong> and{' '}
            <strong>nail polish</strong> with AI. Whether your customers are looking for
            artificial nails with a natural look, acrylic nails, fake nails, styles on real
            nails, or gel nail designs, AR nails let you showcase them instantly—hassle-free
            and without the need for re-dos!
          </p>
        </Reveal>
      </div>
    </section>
  )
}