import { MapPin, Smartphone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: MapPin,
    title: "Drive Local Business",
    description: "Be found precisely when clients are looking for you. Get noticed in search engines, directories, social networks & map services.",
    cta: "Local SEO",
  },
  {
    icon: Smartphone,
    title: "Reach Mobile Customers",
    description: "70% of searches on mobile devices result in user action within an hour. Let's make sure your clients can find you when they are on the go.",
    cta: "Mobile",
  },
  {
    icon: Star,
    title: "Manage Your Reputation",
    description: "Online reviews can go a long way to attracting new clients. Manage your company's reputation online & grow your business.",
    cta: "Reputation",
  },
];

const FeaturesSection = () => {
  return (
    <section className="relative py-24 bg-secondary/30">
      <div className="container">
        {/* Main headline */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            We Manage Your Business Online
            <br />
            <span className="text-gradient">So You Don't Have To</span>
          </h2>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="text-center p-8 group"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Icon with glow */}
              <div className="relative inline-flex mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center group-hover:shadow-glow transition-all duration-500">
                  <feature.icon className="w-10 h-10 text-primary-foreground" />
                </div>
                <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {feature.description}
              </p>

              {/* CTA Button */}
              <Button variant="outline" size="sm">
                {feature.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
