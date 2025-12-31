import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Validation schema matching server-side validation
const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z.string()
    .trim()
    .regex(/^[\d\s\-\(\)\+]+$/, "Please enter a valid phone number")
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long"),
  message: z.string()
    .trim()
    .max(2000, "Message must be less than 2000 characters")
    .optional()
    .or(z.literal("")),
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const validateForm = (): boolean => {
    const result = contactSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ContactFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate before submission
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Save to database with trimmed values
      const trimmedData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
      };
      
      const { error: dbError } = await supabase
        .from("contact_submissions")
        .insert(trimmedData);

      if (dbError) {
        
        throw new Error("Failed to save submission");
      }

      // Send email notification with trimmed data
      const { error: emailError } = await supabase.functions.invoke(
        "send-contact-email",
        {
          body: trimmedData,
        }
      );

      if (emailError) {
        // Don't throw - form was saved, just email failed
      }

      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
      setErrors({});
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Input
          type="text"
          placeholder="Your Name *"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: undefined });
          }}
          required
          className={`h-12 bg-muted/50 border-border/50 focus:border-primary placeholder:text-muted-foreground/60 ${errors.name ? 'border-destructive' : ''}`}
        />
        {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
      </div>
      <div>
        <Input
          type="email"
          placeholder="Email Address *"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          required
          className={`h-12 bg-muted/50 border-border/50 focus:border-primary placeholder:text-muted-foreground/60 ${errors.email ? 'border-destructive' : ''}`}
        />
        {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
      </div>
      <div>
        <Input
          type="tel"
          placeholder="Phone Number *"
          value={formData.phone}
          onChange={(e) => {
            setFormData({ ...formData, phone: e.target.value });
            if (errors.phone) setErrors({ ...errors, phone: undefined });
          }}
          required
          className={`h-12 bg-muted/50 border-border/50 focus:border-primary placeholder:text-muted-foreground/60 ${errors.phone ? 'border-destructive' : ''}`}
        />
        {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
      </div>
      <div>
        <Textarea
          placeholder="Tell us about your project..."
          value={formData.message}
          onChange={(e) => {
            setFormData({ ...formData, message: e.target.value });
            if (errors.message) setErrors({ ...errors, message: undefined });
          }}
          rows={4}
          className={`bg-muted/50 border-border/50 focus:border-primary placeholder:text-muted-foreground/60 resize-none ${errors.message ? 'border-destructive' : ''}`}
        />
        {errors.message && <p className="text-destructive text-sm mt-1">{errors.message}</p>}
      </div>
      <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
};

export default ContactForm;
