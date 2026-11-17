import { HeroPostcard } from "@/components/landing/HeroPostcard";
import { LetterJourney } from "@/components/landing/LetterJourney";
import { PostalFeatureCards } from "@/components/landing/PostalFeatureCards";
import { TelegramCTA } from "@/components/landing/TelegramCTA";

export default function HomePage() {
  return (
    <div className="pb-6">
      <HeroPostcard />
      <LetterJourney />
      <PostalFeatureCards />
      <TelegramCTA />
    </div>
  );
}
