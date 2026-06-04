import { Reveal, PinkBtn } from './nail-ui'

export default function NailHero() {
  return (
    <section className="relative w-full overflow-hidden bg-white">
      {/* Video full width */}
      <div className="relative w-full" style={{ height: 'calc(23.4261vw)', minHeight: 280 }}>
        <video
          src="https://bcw-media.s3.ap-northeast-1.amazonaws.com/nails_topbanner_video_dt_0e47dbd5f7.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="https://bcw-media.s3.ap-northeast-1.amazonaws.com/nails_topbanner_poster_dt_b0fbae4ed6.jpg"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Overlay content */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg">
              <Reveal>
                <h1
                  className="font-black leading-tight tracking-tight text-gray-900 drop-shadow-lg"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
                  }}
                >
                  Virtual Nail Polish Try On
                </h1>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="mt-3 text-sm leading-relaxed text-gray-900 drop-shadow">
                  Try on colors, styles, acrylic, press ons & shapes in a click. Available
                  on website, apps and all major channels.
                </p>
                <p className="mt-2 cursor-pointer text-sm font-semibold text-brand-accent underline underline-offset-2 hover:text-brand-blush transition">
                  Free customized product demo
                </p>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="mt-5 flex flex-wrap gap-3">
                  <PinkBtn>Contact Sales</PinkBtn>
                  <PinkBtn outline>Try It Now</PinkBtn>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}