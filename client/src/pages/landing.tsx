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
                Log workouts in less than 10 seconds with AI-powered tools. Create new workouts in under 30 seconds. 
                Logging WODs has never been so easier. Compete with your box's athletes and track progress like never before.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={() => window.location.href = '/signup'}
                >
                  <Users className="h-5 w-5 mr-2" />
                  Sign Up Free
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-gray-400 text-white hover:bg-white hover:text-secondary bg-transparent"
                  onClick={() => {
                    // Demo functionality
                    const demoSection = document.querySelector('#demo');
                    if (demoSection) {
                      demoSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
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
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary mb-4">Powerful Features for Every Athlete</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Log workouts in less than 10 seconds, create new workouts in under 30 seconds. 
              Compete with your box's athletes using our gamified badges and leaderboards.
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

      {/* Workouts Section */}
      <section id="workouts" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary mb-4">
              Popular <span className="text-gradient">Workouts</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover benchmark CrossFit workouts, create custom WODs, and compete with your community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Fran</h3>
                  <Badge variant="outline">For Time</Badge>
                </div>
                <div className="text-sm text-gray-600 mb-4 font-mono bg-gray-50 p-3 rounded">
                  21-15-9 reps for time:<br/>
                  • Thrusters (95/65 lb)<br/>
                  • Pull-ups
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Avg Time: 8:45</span>
                  <Trophy className="h-4 w-4 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Helen</h3>
                  <Badge variant="outline">For Time</Badge>
                </div>
                <div className="text-sm text-gray-600 mb-4 font-mono bg-gray-50 p-3 rounded">
                  3 rounds for time:<br/>
                  • 400m Run<br/>
                  • 21 KB Swings (53/35)<br/>
                  • 12 Pull-ups
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Avg Time: 12:30</span>
                  <Trophy className="h-4 w-4 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Murph</h3>
                  <Badge variant="destructive">Hero WOD</Badge>
                </div>
                <div className="text-sm text-gray-600 mb-4 font-mono bg-gray-50 p-3 rounded">
                  For time:<br/>
                  • 1 mile Run<br/>
                  • 100 Pull-ups<br/>
                  • 200 Push-ups<br/>
                  • 300 Air Squats<br/>
                  • 1 mile Run
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Avg Time: 45:00</span>
                  <Trophy className="h-4 w-4 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => window.location.href = '/signin'}
            >
              Browse All Workouts
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-secondary mb-6">
            See ACrossFit in <span className="text-gradient">Action</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Watch how athletes and coaches use our platform to achieve their fitness goals.
          </p>
          <div className="bg-gray-100 rounded-xl p-12 mb-8">
            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-600">Demo Video Coming Soon</p>
              </div>
            </div>
          </div>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/signup'}
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-secondary mb-6">
            Simple <span className="text-gradient">Pricing</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Special launch pricing - All features free during beta period
          </p>
          
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Launch Pricing</h3>
              <div className="text-4xl font-bold text-green-600 mb-4">FREE</div>
              <p className="text-gray-600 mb-6">All features included during our launch period</p>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Unlimited workout logging
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  AI-powered workout parsing
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Community leaderboards
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Progress tracking & analytics
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Coach dashboard (for gyms)
                </li>
              </ul>
              <Button className="w-full" size="lg" onClick={() => window.location.href = '/signup'}>
                Get Started Free
              </Button>
            </CardContent>
          </Card>
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
              className="border-white text-white hover:bg-white hover:text-primary bg-transparent"
              onClick={() => {
                const featuresSection = document.querySelector('#features');
                if (featuresSection) {
                  featuresSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
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
                <li><button onClick={() => {const elem = document.querySelector('#features'); elem?.scrollIntoView({behavior: 'smooth'});}} className="hover:text-primary transition-colors text-left">Features</button></li>
                <li><a href="/community" className="hover:text-primary transition-colors">Community</a></li>
                <li><button onClick={() => {const elem = document.querySelector('#pricing'); elem?.scrollIntoView({behavior: 'smooth'});}} className="hover:text-primary transition-colors text-left">Pricing</button></li>
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
                <li><a href="/feedback" className="hover:text-primary transition-colors">Give Feedback</a></li>
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
