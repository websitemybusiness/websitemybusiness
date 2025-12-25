import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const ContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    });
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Input
          type="text"
          placeholder="Your Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="h-12 bg-muted/50 border-border/50 focus:border-primary placeholder:text-muted-foreground/60"
        />
      </div>
      <div>
        <Input
          type="email"
          placeholder="Email Address *"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="h-12 bg-muted/50 border-border/50 focus:border-primary placeholder:text-muted-foreground/60"
        />
      </div>
      <div>
        <Input
          type="tel"
          placeholder="Phone Number *"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
          className="h-12 bg-muted/50 border-border/50 focus:border-primary placeholder:text-muted-foreground/60"
        />
      </div>
      <div>
        <Textarea
          placeholder="Tell us about your project..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={4}
          className="bg-muted/50 border-border/50 focus:border-primary placeholder:text-muted-foreground/60 resize-none"
        />
      </div>
      <Button type="submit" variant="hero" className="w-full" size="lg">
        Send Message
      </Button>
    </form>
  );
};

export default ContactForm;
