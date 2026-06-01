import NailHero from "../components/NailHero";
import NailARSection from "../components/NailARSection";
import NailHowItWorks from "../components/NailHowItWorks";
import NailSampling from "../components/NailSampling";
import NailPBR from "../components/NailPBR";
import NailAmpleFeatures from "../components/NailAmpleFeatures";
import NailFAQ from "../components/NailFAQ";

export default function NailColorPage() {
  return (
    <main>
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