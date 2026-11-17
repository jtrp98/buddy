import { LandingHero } from "@/components/landing/LandingHero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { RevealPreview } from "@/components/landing/RevealPreview";
import { ClosingInvite, Promises } from "@/components/landing/PromisesAndInvite";

export default function HomePage() {
  return (
    <div>
      <LandingHero />
      <HowItWorks />
      <RevealPreview />
      <Promises />
      <ClosingInvite />
    </div>
  );
}
