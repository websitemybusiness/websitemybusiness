import { Button } from "@/components/ui/button";
import ContactForm from "./ContactForm";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center py-20 bg-gradient-hero overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-glow opacity-60" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left content */}
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Expert Web Solutions
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6">
              Professional{" "}
              <span className="text-gradient">Web Design</span>{" "}
              For Growing Businesses
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
              We help ambitious businesses get found online. With our web design and SEO solutions, 
              we'll maximize your exposure to customers who need what you offer.
            </p>

            <p className="text-muted-foreground mb-10 leading-relaxed max-w-xl">
              Whether you're a startup, established company, or growing enterprise, your business 
              deserves a powerful online presence. Let us build your digital foundation and put 
              your company in front of customers searching for industry leaders like you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" asChild>
                <a href="#services">Our Services</a>
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <a href="#contact">Get In Touch</a>
              </Button>
            </div>
          </div>

          {/* Right side - Contact form */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative">
              {/* Glow effect behind form */}
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-xl opacity-20 -z-10 scale-105" />
              
              <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 border border-border/50 shadow-card">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Contact Us</h2>
                  <p className="text-muted-foreground text-sm">
                    Ready to start your project? Get in touch today.
                  </p>
                </div>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
