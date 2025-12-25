import { Button } from "@/components/ui/button";

const TrustSection = () => {
  return (
    <section className="relative py-24 bg-background overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Trusted Partner
          </span>

          {/* Main headline */}
          <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
            Local Businesses Trust Us To
            <br />
            <span className="text-gradient">Manage Their Online Presence</span>
          </h2>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
            Whether you need to manage 1 location or 1,000 – we have the tools to keep your business 
            information up-to-date and effectively manage your reputation through solid website design, 
            development, and search engine optimization. Learn why partnering with us is the best move 
            you can make for your online visibility.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {[
              { value: "500+", label: "Websites Built" },
              { value: "98%", label: "Client Satisfaction" },
              { value: "10+", label: "Years Experience" },
              { value: "24/7", label: "Support" },
            ].map((stat) => (
              <div key={stat.label} className="p-6 rounded-2xl bg-card border border-border/50">
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button variant="hero" size="lg">
            Start Your Project
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
