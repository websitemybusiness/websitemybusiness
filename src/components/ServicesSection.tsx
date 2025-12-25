import { Globe, Search, Mail, MoreHorizontal } from "lucide-react";

const services = [
  {
    icon: Globe,
    title: "Web Design & Development",
    description: "Top designers developing the most conversion-oriented websites in the market today",
    link: "#contact",
  },
  {
    icon: Search,
    title: "Search Engine Optimization",
    description: "World-class SEO services maximizing your return on investment and online visibility",
    link: "#contact",
  },
  {
    icon: Mail,
    title: "Email Marketing",
    description: "Keep your business relevant to current and prospective customers, keeping them coming back",
    link: "#contact",
  },
  {
    icon: MoreHorizontal,
    title: "Other Services",
    description: "An array of additional online marketing services, including hosting, content & social media",
    link: "#contact",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="relative py-24 bg-background">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-glow opacity-50" />
      
      <div className="container relative z-10">
        {/* Section header */}
        <div className="text-center mb-16 animate-fade-in">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            What We Do
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Services <span className="text-gradient">We Offer</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive digital solutions to help your business thrive online
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <a
              key={service.title}
              href={service.link}
              className="group relative p-8 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 shadow-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 group-hover:shadow-glow transition-all duration-500" aria-hidden="true">
                <service.icon className="w-7 h-7 text-primary-foreground" aria-hidden="true" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {service.description}
              </p>

              {/* Hover arrow */}
              <div className="mt-6 flex items-center text-primary font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-primary opacity-5 rounded-bl-full rounded-tr-2xl" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
