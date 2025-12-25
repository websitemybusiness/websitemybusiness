import { Button } from "@/components/ui/button";
import ContactForm from "./ContactForm";

const CTASection = () => {
  return (
    <section className="relative py-24 bg-gradient-hero overflow-hidden" aria-labelledby="cta-heading">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-glow opacity-40" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div>
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Ready To Talk?
            </span>
            <h2 id="cta-heading" className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Let's Build Something{" "}
              <span className="text-gradient">Amazing Together</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Ready to take your business to the next level? Our team of experts is here to help 
              you create a stunning website that drives results. Get in touch today and let's 
              discuss your project.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" asChild>
                <a href="tel:+2348032655092">Call Us Now</a>
              </Button>
              <Button variant="heroOutline" size="lg" asChild>
                <a href="https://wa.me/2348027441364" target="_blank" rel="noopener noreferrer">WhatsApp Us</a>
              </Button>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="bg-card/60 backdrop-blur-xl rounded-3xl p-8 border border-border/50 shadow-card">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Get Your Free Quote</h3>
              <p className="text-muted-foreground text-sm">
                Fill out the form and we'll get back to you within 24 hours
              </p>
            </div>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
