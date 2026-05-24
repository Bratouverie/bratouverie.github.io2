import Nav from '../components/Nav';
import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
import StatsCounter from '../components/StatsCounter';
import ServicesSection from '../components/ServicesSection';
import WhyUsSection from '../components/WhyUsSection';
import NationalProjectsSection from '../components/NationalProjectsSection';
import DocumentsSection from '../components/DocumentsSection';
import TeamSection from '../components/TeamSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#05070A] font-inter">
      <Nav />
      <Hero />
      <AboutSection />
      <StatsCounter />
      <ServicesSection />
      <WhyUsSection />
      <NationalProjectsSection />
      <DocumentsSection />
      <TeamSection />
      <ContactSection />
      <Footer />
    </div>
  );
}