import { Reveal, SectionHeader, PrimaryButton, OutlineButton, VMTO_IMAGES } from './vmto-ui'

const platforms = ['Google Search', 'Instagram', 'YouTube', 'TikTok', 'Snapchat', 'Brand Sites & Apps']

export default function VmtoOmnichannel() {
  return (
    <section className="overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-16 lg:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader
            eyebrow="One Solution, Every Channel"
            title="Seamless Omnichannel Integration"
            subtitle="A unified virtual makeover solution for omnichannel e-commerce — reach customers wherever they discover and shop for beauty."
          />
        </Reveal>

        {/* Cross-platform card */}
        <div className="mt-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <h3
              className="text-2xl font-black text-gray-900"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Cross-Platform Virtual Makeover Solution
            </h3>
            <p className="mt-3 text-base leading-relaxed text-gray-600">
              All of your virtual makeup try-on experiences are available across the
              following supported platforms, delivering a consistent AR try-on experience
              on every channel.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {platforms.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-rose-200 bg-white/80 px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm"
                >
                  {p}
                </span>
              ))}
            </div>
            <div className="mt-8">
              <OutlineButton>Advanced Try-On Demo →</OutlineButton>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative mx-auto w-full max-w-xs">
              <div className="overflow-hidden rounded-[2rem] border-8 border-gray-900 bg-gray-900 shadow-2xl">
                <img
                  src={VMTO_IMAGES.portraitAfter}
                  alt="Virtual makeover on mobile"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>

        {/* In-store solution card */}
        <Reveal delay={0.1}>
          <div className="mt-16 grid grid-cols-1 items-center gap-10 rounded-3xl bg-white p-6 shadow-card sm:p-10 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 overflow-hidden rounded-2xl lg:order-1">
              <img
                src={VMTO_IMAGES.storeBg}
                alt="In-store AR makeup mirror"
                className="h-64 w-full object-cover lg:h-80"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h3
                className="text-2xl font-black text-gray-900"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                In-Store Makeup AI &amp; AR Virtual Try-On
              </h3>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                Turning in-store AR virtual makeup solutions allows shoppers to try on in
                real time using a smart in-store beauty mirror. It's a safe alternative to
                in-store testers, connecting the in-store experience with online discovery.
              </p>
              <div className="mt-8">
                <PrimaryButton>Bring It In-Store</PrimaryButton>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
