import { Reveal, SectionHeading, ArrowLink } from './nail-ui'

export default function NailHowItWorks() {
  return (
    <section className="bg-gray-50 py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <Reveal delay={0.1}>
          <SectionHeading
            eyebrow="How It Works"
            title="How Does Virtual Nail Try-On Work?"
          />
          <p className="mt-4 text-base leading-relaxed text-gray-600">
            Provide your customers with an instant live preview of your{' '}
            <strong>nail products</strong> or <strong>press-on nails</strong> on their
            hands, without the messy clean ups and time-consuming application.
          </p>
          <p className="mt-3 text-base leading-relaxed text-gray-600">
            Let shoppers experiment freely with endless color and style combinations before
            committing, and deliver an ultra-personalized shopping journey that helps{' '}
            <strong>drive sales</strong>.
          </p>
          <div className="mt-6">
            <ArrowLink>See How It Works</ArrowLink>
          </div>
        </Reveal>

        <Reveal>
          <div className="overflow-hidden rounded-2xl shadow-xl">
            <img
              src="https://bcw-media.s3.ap-northeast-1.amazonaws.com/nails_s3_poster_d6d2b1fd50.jpg"
              alt="How virtual nail try-on works"
              className="w-full object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}