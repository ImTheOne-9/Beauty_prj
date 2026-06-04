import NailHero from "../components/NailHero";
import NailARSection from "../components/NailARSection";
import NailHowItWorks from "../components/NailHowItWorks";
import NailSampling from "../components/NailSampling";
import NailPBR from "../components/NailPBR";
import NailAmpleFeatures from "../components/NailAmpleFeatures";
import NailFAQ from "../components/NailFAQ";

export default function NailColorPage() {
  return (
    <main className="public-shell min-h-screen overflow-x-hidden bg-white">
      <NailHero />
      <NailARSection />
      <NailHowItWorks />
      <NailSampling />
      <NailPBR />
      <NailAmpleFeatures />
      <NailFAQ />
    </main>
  )
}
