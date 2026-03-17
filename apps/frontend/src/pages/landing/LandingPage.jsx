import LandingNavbar from '../../components/landing/LandingNavbar';
import LandingHero from '../../components/landing/LandingHero';
import LandingFeatures from '../../components/landing/LandingFeatures';
import LandingOffersPreview from '../../components/landing/LandingOffersPreview';
import LandingFooter from '../../components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <LandingNavbar />
      <LandingHero />
      <LandingFeatures />
      <LandingOffersPreview />
      <LandingFooter />
    </div>
  );
}
