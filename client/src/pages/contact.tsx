import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Phone, 
  MapPin,
  Send,
  MessageSquare,
  Dumbbell,
  Clock,
  Users
} from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Send email to akshatchaturvedi17@gmail.com
      const emailBody = `
Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}
      `.trim();
      
      // Use mailto to open email client
      const mailtoUrl = `mailto:akshatchaturvedi17@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(mailtoUrl, '_blank');
      
      toast({
        title: "Email Client Opened!",
        description: "Your email client should now be open. Please send the email to complete your message.",
      });
      
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Please try again or contact us directly at akshatchaturvedi17@gmail.com",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="gradient-hero text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Get in <span className="text-gradient">Touch</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Have questions? Want to see a demo? We'd love to hear from you and help you get started with ACrossFit. 
            We typically respond within 1 hour.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-secondary mb-6">Let's Connect</h2>
                <p className="text-lg text-gray-600 mb-8">
                  We're here to help you transform your CrossFit community. Whether you're a gym owner, coach, or athlete, 
                  we want to hear from you.
                </p>
              </div>

              <div className="space-y-6">
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 rounded-full p-3">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary">Email</h3>
                        <p className="text-gray-600">akshatchaturvedi17@gmail.com</p>
                        <p className="text-sm text-gray-500">We typically respond within 1 hour</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-accent">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-accent/10 rounded-full p-3">
                        <Phone className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary">Phone</h3>
                        <p className="text-gray-600">+91-8209347140</p>
                        <p className="text-sm text-gray-500">Monday - Friday, 9AM - 6PM IST</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-success">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-success/10 rounded-full p-3">
                        <MapPin className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary">Location</h3>
                        <p className="text-gray-600">Hyderabad, India</p>
                        <p className="text-sm text-gray-500">Available for remote meetings</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* FAQ Section */}
              <div className="mt-12">
                <h3 className="text-xl font-semibold text-secondary mb-6">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">How much does ACrossFit cost?</h4>
                      <p className="text-sm text-gray-600">
                        ACrossFit is free for individual athletes and small gyms with up to 5 athletes. 
                        Larger communities have affordable monthly plans starting at $29.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Do you offer demos?</h4>
                      <p className="text-sm text-gray-600">
                        Yes! We offer personalized demos for gym owners and coaches. 
                        Contact us to schedule a 30-minute demo session.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Is there a mobile app?</h4>
                      <p className="text-sm text-gray-600">
                        Our mobile app is coming in Phase 2. Currently, our web app is fully responsive 
                        and works great on mobile devices.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="What can we help you with?"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Tell us more about your needs..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">Other Ways to Get Help</h2>
            <p className="text-xl text-gray-600">
              We're committed to providing excellent support through multiple channels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="bg-primary/10 rounded-full p-4 w-fit mx-auto mb-6">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Community Forum</h3>
                <p className="text-gray-600 mb-6">
                  Connect with other gym owners and athletes in our community forum. Share tips, ask questions, and learn from others.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "Coming Soon...",
                      description: "Community Forum will be available soon. For now, please contact us directly.",
                    });
                  }}
                >
                  Join Forum
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="bg-accent/10 rounded-full p-4 w-fit mx-auto mb-6">
                  <MessageSquare className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Live Chat</h3>
                <p className="text-gray-600 mb-6">
                  Get instant help with our live chat support. Available during business hours for quick questions and technical support.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "Coming Soon...",
                      description: "Live Chat will be available soon. For now, please contact us directly.",
                    });
                  }}
                >
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="bg-success/10 rounded-full p-4 w-fit mx-auto mb-6">
                  <Clock className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-4">24/7 Help Center</h3>
                <p className="text-gray-600 mb-6">
                  Access our comprehensive help center with articles, tutorials, and troubleshooting guides available 24/7.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "Coming Soon...",
                      description: "24/7 Help Center will be available soon. For now, please contact us directly.",
                    });
                  }}
                >
                  Browse Articles
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Anonymous Feedback Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">Anonymous Feedback</h2>
            <p className="text-xl text-gray-600">
              Help us improve ACrossFit by sharing your thoughts anonymously.
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const feedback = formData.get('feedback') as string;
                  
                  if (feedback.trim()) {
                    const mailtoUrl = `mailto:akshatchaturvedi17@gmail.com?subject=Anonymous Feedback&body=${encodeURIComponent(`Anonymous Feedback:\n\n${feedback}`)}`;
                    window.open(mailtoUrl, '_blank');
                    
                    toast({
                      title: "Feedback Sent!",
                      description: "Thank you for your anonymous feedback. It will help us improve.",
                    });
                    
                    (e.target as HTMLFormElement).reset();
                  }
                }}
                className="space-y-6"
              >
                <div>
                  <Label htmlFor="feedback">Your Feedback</Label>
                  <Textarea
                    id="feedback"
                    name="feedback"
                    placeholder="Share your thoughts, suggestions, or report issues anonymously..."
                    rows={6}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Send Anonymous Feedback
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Dumbbell className="h-6 w-6 text-primary mr-2" />
                <span className="text-xl font-bold">ACrossFit</span>
              </div>
              <p className="text-gray-400">
                Making CrossFit training fun with AI-powered tools.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="/community" className="hover:text-primary transition-colors">Community</a></li>
                <li><a href="/api/login" className="hover:text-primary transition-colors">Get Started</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="/privacy" className="hover:text-primary transition-colors">Privacy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/contact" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ACrossFit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
