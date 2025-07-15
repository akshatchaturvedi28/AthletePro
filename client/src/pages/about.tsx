import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { 
  Dumbbell, 
  Users, 
  Target, 
  Trophy,
  Heart,
  Zap,
  ArrowRight
} from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="gradient-hero text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About <span className="text-gradient">ACrossFit</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            We're on a mission to make CrossFit training more engaging, intelligent, and community-focused through the power of AI and modern technology.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-secondary mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                At ACrossFit, we believe that fitness should be fun, engaging, and accessible to everyone. We're building the future of CrossFit training by combining artificial intelligence with community-driven features that motivate athletes and empower coaches.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Our platform eliminates the friction in workout logging, provides intelligent insights, and fosters meaningful connections between athletes and coaches. We're not just building software – we're building stronger communities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => window.location.href = '/api/login'}
                >
                  Join Our Community
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/contact'}
                >
                  Get in Touch
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">10,000+</h3>
                  <p className="text-sm text-gray-600">Active Athletes</p>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-accent">
                <CardContent className="p-6">
                  <Dumbbell className="h-8 w-8 text-accent mb-4" />
                  <h3 className="font-semibold mb-2">500+</h3>
                  <p className="text-sm text-gray-600">Partner Gyms</p>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-success">
                <CardContent className="p-6">
                  <Target className="h-8 w-8 text-success mb-4" />
                  <h3 className="font-semibold mb-2">1M+</h3>
                  <p className="text-sm text-gray-600">Workouts Logged</p>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-warning">
                <CardContent className="p-6">
                  <Trophy className="h-8 w-8 text-warning mb-4" />
                  <h3 className="font-semibold mb-2">4.9/5</h3>
                  <p className="text-sm text-gray-600">User Rating</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-secondary mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core principles guide everything we do and help us build a platform that truly serves the CrossFit community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="bg-primary/10 rounded-full p-4 w-fit mx-auto mb-6">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Community First</h3>
                <p className="text-gray-600">
                  We put the CrossFit community at the heart of everything we do. Our features are designed to strengthen connections between athletes and coaches.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="bg-accent/10 rounded-full p-4 w-fit mx-auto mb-6">
                  <Zap className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Innovation</h3>
                <p className="text-gray-600">
                  We leverage cutting-edge AI and technology to solve real problems in the CrossFit world, making training more efficient and engaging.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="bg-success/10 rounded-full p-4 w-fit mx-auto mb-6">
                  <Target className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Accessibility</h3>
                <p className="text-gray-600">
                  We believe powerful fitness tools should be accessible to everyone, regardless of gym size or budget. That's why we start free.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-4">Our Story</h2>
            <p className="text-xl text-gray-600">
              Born from the CrossFit community, built for the CrossFit community.
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-4">The Problem We Saw</h3>
              <p className="text-gray-600">
                As passionate CrossFit athletes and coaches ourselves, we experienced firsthand the frustration of clunky workout logging systems, 
                lack of proper progress tracking, and the challenges of building engaged communities. We saw gyms struggling with spreadsheets, 
                WhatsApp groups, and fragmented tools that didn't speak to each other.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-4">The Solution We Built</h3>
              <p className="text-gray-600">
                We decided to build the platform we wished we had. ACrossFit combines the power of AI with intuitive design to create 
                a seamless experience for both athletes and coaches. Our intelligent workout parser can understand any CrossFit workout 
                format, our leaderboards drive community engagement, and our analytics help coaches make data-driven decisions.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold mb-4">The Future We're Building</h3>
              <p className="text-gray-600">
                We're just getting started. Our roadmap includes mobile apps, advanced AI coaching insights, wearable integrations, 
                and even more community features. We're building the future of CrossFit training, one workout at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-accent text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Join Our Mission?</h2>
          <p className="text-xl mb-8 text-white/90">
            Whether you're an athlete looking to track your progress or a coach building a community, we'd love to have you on board.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => window.location.href = '/api/login'}
            >
              Start Your Journey
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-primary"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Us
            </Button>
          </div>
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
