import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare,
  Send,
  Shield,
  Users,
  Heart,
  Star
} from "lucide-react";

export default function Feedback() {
  const [formData, setFormData] = useState({
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
      // Try to send feedback via API first
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: formData.subject || "Anonymous Feedback",
          message: formData.message,
          type: 'feedback'
        }),
      });

      if (response.ok) {
        toast({
          title: "Feedback Sent!",
          description: "Thank you for your anonymous feedback. We appreciate your input!",
        });
        setFormData({ subject: "", message: "" });
      } else {
        throw new Error('API failed');
      }
    } catch (error) {
      // Fallback to mailto
      const emailBody = `Anonymous Feedback:\n\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`;
      const mailtoUrl = `mailto:akshatchaturvedi17@gmail.com?subject=Anonymous Feedback: ${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(mailtoUrl, '_blank');
      
      toast({
        title: "Email Client Opened!",
        description: "Your email client should now be open. Please send the email to submit your feedback.",
      });
      
      setFormData({ subject: "", message: "" });
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
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Anonymous <span className="text-gradient">Feedback</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Help us improve ACrossFit! Share your thoughts, suggestions, or concerns completely anonymously. 
            Your feedback shapes our future.
          </p>
        </div>
      </section>

      {/* Feedback Form Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Info Section */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-secondary mb-6">Your Voice Matters</h2>
                <p className="text-lg text-gray-600 mb-8">
                  We believe in continuous improvement and value every piece of feedback from our community. 
                  Your anonymous input helps us build better features and experiences.
                </p>
              </div>

              <div className="space-y-6">
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 rounded-full p-3">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary">100% Anonymous</h3>
                        <p className="text-gray-600">No personal information required</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-accent">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-accent/10 rounded-full p-3">
                        <Heart className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary">We Listen</h3>
                        <p className="text-gray-600">Every feedback is read and considered</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-success">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-success/10 rounded-full p-3">
                        <Star className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary">Shapes Our Future</h3>
                        <p className="text-gray-600">Your feedback drives our roadmap</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* What to Include */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-secondary mb-4">What to Include</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Feature requests or improvements</li>
                  <li>• Bug reports or technical issues</li>
                  <li>• User experience feedback</li>
                  <li>• Suggestions for new functionality</li>
                  <li>• General thoughts about ACrossFit</li>
                </ul>
              </div>
            </div>

            {/* Feedback Form */}
            <div>
              <Card className="shadow-xl border-0">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-secondary">Share Your Feedback</CardTitle>
                  <p className="text-gray-600">Help us make ACrossFit even better</p>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject (Optional)
                      </label>
                      <Input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="Brief topic or category"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Feedback <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Share your thoughts, suggestions, or concerns..."
                        className="w-full min-h-[120px]"
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isSubmitting || !formData.message.trim()}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Anonymous Feedback
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      This feedback is completely anonymous. No personal information is collected or stored.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold">ACrossFit</span>
            </div>
            <p className="text-gray-400 mb-4">
              Making CrossFit training fun with AI-powered tools.
            </p>
            <div className="border-t border-gray-700 pt-4">
              <p className="text-gray-400">&copy; 2024 ACrossFit. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}