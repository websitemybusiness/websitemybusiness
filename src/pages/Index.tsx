import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

const Index = () => {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main className="min-h-screen bg-background">
        <HeroSection />
        <ServicesSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
};

export default Index;
