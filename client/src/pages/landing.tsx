import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { 
  Dumbbell, 
  TrendingUp, 
  Users, 
  Calendar, 
  UserCog, 
  Smartphone,
  Trophy,
  Target,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  Star,
  ArrowRight
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="gradient-hero text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
                  <Zap className="h-4 w-4 mr-2" />
                  AI-Powered Training
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                Make CrossFit Training 
                <span className="text-gradient block">Fun & Intelligent</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                AI-powered tools that empower athletes to improve, help coaches manage communities, and foster meaningful connections. Track progress, log workouts, and compete with your community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={() => window.location.href = '/api/login'}
                >
                  <Users className="h-5 w-5 mr-2" />
                  Sign Up Free
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-gray-400 text-white hover:bg-white hover:text-secondary"
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center space-x-8 text-sm text-gray-400">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>10,000+ Athletes</span>
                </div>
                <div className="flex items-center">
                  <Trophy className="h-4 w-4 mr-2" />
                  <span>500+ Gyms</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  <span>4.9/5 Rating</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6 transform rotate-3 hover:rotate-0 transition-transform">
                <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between text-white">
                    <h3 className="font-semibold">Today's WOD</h3>
                    <Badge variant="secondary" className="bg-white/20 text-white">Fran</Badge>
                  </div>
                </div>
                <div className="space-y-3 text-white">
                  <div className="flex items-center justify-between">
                    <span>21-15-9 Thrusters (95/65lb)</span>
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pull-ups</span>
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex justify-between text-sm">
                      <span>Your Time: 4:32</span>
                      <span className="text-success">PR! 🎉</span>
                    </div>
                  </div>
                </div>
              </Card>
              
              <div className="absolute -top-4 -right-4 bg-accent text-white rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold">47</div>
                <div className="text-sm">Day Streak</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary mb-4">Powerful Features for Every Athlete</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From AI-powered workout parsing to community leaderboards, ACrossFit provides everything you need to excel in your fitness journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow border-0 bg-gray-50">
              <CardContent className="p-8">
                <div className="bg-primary/10 rounded-xl p-4 w-fit mb-6">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-4">AI Workout Parsing</h3>
                <p className="text-gray-600 mb-4">
                  Simply type your workout like a message. Our AI understands and parses complex CrossFit workouts automatically.
                </p>
                <div className="bg-white rounded-lg p-3 font-mono text-sm text-gray-700">
                  "21-15-9 thrusters pull-ups" → Parsed instantly ✨
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 bg-gray-50">
              <CardContent className="p-8">
                <div className="bg-accent/10 rounded-xl p-4 w-fit mb-6">
                  <TrendingUp className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-4">Progress Tracking</h3>
                <p className="text-gray-600 mb-4">
                  Visual dashboards show your improvements over time. Track PRs, streaks, and performance metrics.
                </p>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span>Fran PR</span>
                    <span className="text-success font-semibold">↑ 15% improvement</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 bg-gray-50">
              <CardContent className="p-8">
                <div className="bg-warning/10 rounded-xl p-4 w-fit mb-6">
                  <Users className="h-8 w-8 text-warning" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-4">Community Features</h3>
                <p className="text-gray-600 mb-4">
                  Join your gym's community, compete on leaderboards, and get motivated by fellow athletes.
                </p>
                <div className="flex space-x-2">
                  <div className="bg-white rounded-full p-2">
                    <Trophy className="h-4 w-4 text-warning" />
                  </div>
                  <div className="bg-white rounded-full p-2">
                    <Target className="h-4 w-4 text-accent" />
                  </div>
                  <div className="bg-white rounded-full p-2">
                    <Zap className="h-4 w-4 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 bg-gray-50">
              <CardContent className="p-8">
                <div className="bg-success/10 rounded-xl p-4 w-fit mb-6">
                  <Calendar className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-4">Workout Calendar</h3>
                <p className="text-gray-600 mb-4">
                  Plan future workouts, review past sessions, and maintain consistent training schedules.
                </p>
                <div className="bg-white rounded-lg p-2">
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    <div className="bg-primary text-white rounded text-center p-1">M</div>
                    <div className="bg-gray-200 text-gray-600 rounded text-center p-1">T</div>
                    <div className="bg-primary text-white rounded text-center p-1">W</div>
                    <div className="bg-gray-200 text-gray-600 rounded text-center p-1">T</div>
                    <div className="bg-primary text-white rounded text-center p-1">F</div>
                    <div className="bg-gray-200 text-gray-600 rounded text-center p-1">S</div>
                    <div className="bg-gray-200 text-gray-600 rounded text-center p-1">S</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 bg-gray-50">
              <CardContent className="p-8">
                <div className="bg-destructive/10 rounded-xl p-4 w-fit mb-6">
                  <UserCog className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-4">Coach Dashboard</h3>
                <p className="text-gray-600 mb-4">
                  Manage your gym community, program workouts, and track athlete progress with powerful coaching tools.
                </p>
                <div className="bg-white rounded-lg p-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Active Athletes</span>
                    <Badge variant="destructive">24</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 bg-gray-50">
              <CardContent className="p-8">
                <div className="bg-purple-500/10 rounded-xl p-4 w-fit mb-6">
                  <Smartphone className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-4">Mobile Ready</h3>
                <p className="text-gray-600 mb-4">
                  Access your workouts anywhere with our responsive web app. Mobile app coming in Phase 2.
                </p>
                <div className="flex space-x-2">
                  <div className="bg-white rounded-lg p-2 w-8 h-12 flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="bg-white rounded-lg p-2 w-12 h-8 flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-purple-500 rotate-90" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-accent text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your CrossFit Journey?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of athletes and coaches who are already using ACrossFit to achieve their fitness goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => window.location.href = '/api/login'}
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-primary"
            >
              Learn More
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
              <p className="text-gray-400 mb-4">
                Making CrossFit training fun with AI-powered tools for athletes and coaches.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="/community" className="hover:text-primary transition-colors">Community</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
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
