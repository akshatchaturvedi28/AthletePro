import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/layout/navbar";
import { 
  Users, 
  Trophy, 
  BarChart3, 
  UserCog,
  Calendar,
  MessageSquare,
  Target,
  Zap,
  Check,
  ArrowRight,
  Star,
  Quote
} from "lucide-react";

export default function CommunityLanding() {
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
                  <Users className="h-4 w-4 mr-2" />
                  For Gym Owners
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                Build Your Ultimate
                <span className="text-gradient block">CrossFit Community</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Empower your athletes with AI-powered workout tracking, create engaging leaderboards, and build a thriving fitness community that keeps members coming back.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={() => {
                    // Show modal asking user to sign up as admin first
                    if (confirm('Please sign up as an Admin first to create a community. Would you like to go to admin signup?')) {
                      window.location.href = '/admin/signin?signup=true';
                    }
                  }}
                >
                  <Users className="h-5 w-5 mr-2" />
                  Create Community
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-gray-400 text-white hover:bg-white hover:text-secondary bg-transparent"
                  onClick={() => {
                    const demoSection = document.querySelector('#demo');
                    if (demoSection) {
                      demoSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  See Demo
                </Button>
              </div>
              <div className="flex items-center space-x-8 text-sm text-gray-400">
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-success" />
                  <span>Free for up to 5 athletes</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-success" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-success" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
                <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between text-white">
                    <h3 className="font-semibold">Community Dashboard</h3>
                    <Badge variant="secondary" className="bg-white/20 text-white">Live</Badge>
                  </div>
                </div>
                <div className="space-y-4 text-white">
                  <div className="flex items-center justify-between">
                    <span>Active Athletes</span>
                    <span className="font-bold text-2xl text-primary">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Today's Participants</span>
                    <span className="font-bold text-2xl text-accent">18</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>This Week's WODs</span>
                    <span className="font-bold text-2xl text-success">5</span>
                  </div>
                </div>
              </Card>
              
              <div className="absolute -top-4 -right-4 bg-success text-white rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold">92%</div>
                <div className="text-sm">Retention Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary mb-4">Everything You Need to Manage Your Community</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From member management to workout programming, ACrossFit provides all the tools you need to build a thriving CrossFit community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow border-0 bg-gray-50">
              <CardContent className="p-8">
                <div className="bg-primary/10 rounded-xl p-4 w-fit mb-6">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-4">Member Management</h3>
                <p className="text-gray-600 mb-4">
                  Easily add, remove, and manage athletes and coaches. Track member progress and engagement.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-success" />
                    Add unlimited athletes
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-success" />
                    Role-based permissions
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-success" />
                    Member profiles & stats
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 bg-gray-50">
              <CardContent className="p-8">
                <div className="bg-accent/10 rounded-xl p-4 w-fit mb-6">
                  <Trophy className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-4">Community Leaderboards</h3>
                <p className="text-gray-600 mb-4">
                  Motivate your athletes with real-time leaderboards and performance rankings.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-success" />
                    Daily WOD rankings
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-success" />
                    Benchmark comparisons
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-success" />
                    Progress tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 bg-gray-50">
              <CardContent className="p-8">
                <div className="bg-success/10 rounded-xl p-4 w-fit mb-6">
                  <Target className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-4">Workout Programming</h3>
                <p className="text-gray-600 mb-4">
                  Create and share workouts with AI-powered parsing. Schedule future WODs with ease.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-success" />
                    AI workout parsing
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-success" />
                    Schedule future WODs
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-success" />
                    Workout templates
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 bg-gray-50">
              <CardContent className="p-8">
                <div className="bg-warning/10 rounded-xl p-4 w-fit mb-6">
                  <BarChart3 className="h-8 w-8 text-warning" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-4">Performance Analytics</h3>
                <p className="text-gray-600 mb-4">
                  Track community performance with detailed analytics and insights.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-success" />
                    Attendance tracking
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-success" />
                    Performance metrics
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-success" />
                    Progress reports
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 bg-gray-50">
              <CardContent className="p-8">
                <div className="bg-purple-500/10 rounded-xl p-4 w-fit mb-6">
                  <MessageSquare className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-4">Community Communication</h3>
                <p className="text-gray-600 mb-4">
                  Keep your community engaged with announcements and updates.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-success" />
                    Post announcements
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-success" />
                    Schedule updates
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-success" />
                    Event notifications
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 bg-gray-50">
              <CardContent className="p-8">
                <div className="bg-destructive/10 rounded-xl p-4 w-fit mb-6">
                  <UserCog className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-4">Coach Tools</h3>
                <p className="text-gray-600 mb-4">
                  Empower your coaches with tools to track athlete progress and provide feedback.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-success" />
                    Athlete notes
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-success" />
                    Progress tracking
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-success" />
                    Performance insights
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free and scale as your community grows. No hidden fees, no long-term contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Starter */}
            <Card className="border-2 border-primary relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Small Gym</CardTitle>
                <div className="text-4xl font-bold text-primary">FREE</div>
                <p className="text-gray-600">Up to 5 athletes</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-3 text-success" />
                    <span>All community features</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-3 text-success" />
                    <span>AI workout parsing</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-3 text-success" />
                    <span>Leaderboards</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-3 text-success" />
                    <span>Basic analytics</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-primary hover:bg-primary/90">
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Growing */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Growing Gym</CardTitle>
                <div className="text-4xl font-bold text-secondary">$29</div>
                <p className="text-gray-600">Up to 25 athletes</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-3 text-success" />
                    <span>Everything in Starter</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-3 text-success" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-3 text-success" />
                    <span>Custom branding</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-3 text-success" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Established */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Established Gym</CardTitle>
                <div className="text-4xl font-bold text-secondary">$59</div>
                <p className="text-gray-600">Up to 50 athletes</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-3 text-success" />
                    <span>Everything in Growing</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-3 text-success" />
                    <span>Multiple coaches</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-3 text-success" />
                    <span>Advanced reporting</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-3 text-success" />
                    <span>API access</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="text-4xl font-bold text-secondary">Custom</div>
                <p className="text-gray-600">100+ athletes</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-3 text-success" />
                    <span>Everything in Established</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-3 text-success" />
                    <span>White-label solution</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-3 text-success" />
                    <span>Dedicated support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-3 text-success" />
                    <span>Custom integrations</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary mb-4">What Gym Owners Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join hundreds of gym owners who have transformed their communities with ACrossFit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-6">
                  "ACrossFit has completely transformed how we manage our gym community. The AI workout parsing saves us hours every week!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-4">
                    SJ
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-gray-500">Owner, CrossFit Central</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-6">
                  "Our member retention has increased by 30% since implementing ACrossFit. The leaderboards keep everyone motivated!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold mr-4">
                    MR
                  </div>
                  <div>
                    <p className="font-semibold">Mike Rodriguez</p>
                    <p className="text-sm text-gray-500">Owner, Elite CrossFit</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-6">
                  "The analytics and progress tracking features help us provide better coaching and keep our athletes engaged."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center text-white font-bold mr-4">
                    LC
                  </div>
                  <div>
                    <p className="font-semibold">Lisa Chen</p>
                    <p className="text-sm text-gray-500">Owner, Apex Fitness</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary mb-4">See ACrossFit in Action</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch how easy it is to manage your CrossFit community with our comprehensive platform.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-primary rounded-full p-2 mt-1">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-secondary mb-2">Member Management</h3>
                  <p className="text-gray-600">Add members, assign roles, and track engagement all from one dashboard.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-accent rounded-full p-2 mt-1">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-secondary mb-2">AI Workout Parsing</h3>
                  <p className="text-gray-600">Simply paste workout descriptions and our AI automatically creates structured WODs.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-success rounded-full p-2 mt-1">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-secondary mb-2">Real-time Leaderboards</h3>
                  <p className="text-gray-600">Keep your community motivated with automatic leaderboards and progress tracking.</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Card className="bg-white shadow-2xl border-0">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-primary to-accent p-4 text-white">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Community Dashboard</h4>
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">42</div>
                        <div className="text-sm text-gray-600">Active Members</div>
                      </div>
                      <div className="text-center p-4 bg-accent/5 rounded-lg">
                        <div className="text-2xl font-bold text-accent">156</div>
                        <div className="text-sm text-gray-600">Workouts Logged</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">Today's WOD: "Fran"</span>
                        <Badge variant="secondary">12 completed</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">Weekly Challenge</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-accent text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Gym Community?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of gym owners who trust ACrossFit to manage their communities and engage their athletes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => window.location.href = '/api/login'}
            >
              Start Your Free Community
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-primary bg-transparent"
              onClick={() => {
                window.open('mailto:akshatchaturvedi17@gmail.com?subject=Schedule Demo Request&body=Hi, I would like to schedule a demo for ACrossFit community management platform.', '_blank');
              }}
            >
              Schedule a Demo
            </Button>
          </div>
          <p className="text-sm text-white/80 mt-4">
            No credit card required • Free for up to 5 athletes • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-primary mr-2" />
                <span className="text-xl font-bold">ACrossFit</span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering CrossFit communities with AI-powered tools for coaches and athletes.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => { window.location.href = '/#features'; }} className="hover:text-primary transition-colors text-left">Features</button></li>
                <li><button onClick={() => { window.location.href = '/#pricing'; }} className="hover:text-primary transition-colors text-left">Pricing</button></li>
                <li><a href="/signup" className="hover:text-primary transition-colors">Get Started</a></li>
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
