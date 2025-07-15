import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Shield, Eye, Lock, Database, UserCheck, Mail, Globe } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="gradient-hero text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Privacy <span className="text-gradient">Policy</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
          </p>
          <p className="text-sm text-gray-400">
            Last updated: December 15, 2024
          </p>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  At ACrossFit, we are committed to protecting your privacy and maintaining the security of your personal information. 
                  This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use our 
                  CrossFit community management platform.
                </p>
                <p className="text-gray-600">
                  By using ACrossFit, you agree to the collection and use of information in accordance with this policy.
                </p>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2 text-accent" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">Personal Information</h3>
                    <ul className="text-gray-600 space-y-1 ml-4">
                      <li>• Name and email address</li>
                      <li>• Phone number (optional)</li>
                      <li>• Profile information (bio, occupation, social media handles)</li>
                      <li>• Body metrics (weight, height - optional)</li>
                      <li>• Profile photos</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">Workout and Performance Data</h3>
                    <ul className="text-gray-600 space-y-1 ml-4">
                      <li>• Workout logs and performance scores</li>
                      <li>• Personal records and achievements</li>
                      <li>• Training history and progress metrics</li>
                      <li>• Community participation data</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">Technical Information</h3>
                    <ul className="text-gray-600 space-y-1 ml-4">
                      <li>• Device information and IP address</li>
                      <li>• Browser type and version</li>
                      <li>• Usage patterns and app interactions</li>
                      <li>• Log files and crash reports</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Your Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-success" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">Core Platform Features</h3>
                    <ul className="text-gray-600 space-y-1 ml-4">
                      <li>• Providing workout tracking and progress monitoring</li>
                      <li>• Enabling community features and leaderboards</li>
                      <li>• Facilitating communication between coaches and athletes</li>
                      <li>• Generating performance insights and analytics</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">Service Improvement</h3>
                    <ul className="text-gray-600 space-y-1 ml-4">
                      <li>• Improving our AI workout parsing algorithms</li>
                      <li>• Enhancing user experience and platform functionality</li>
                      <li>• Developing new features based on usage patterns</li>
                      <li>• Providing customer support and technical assistance</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">Communication</h3>
                    <ul className="text-gray-600 space-y-1 ml-4">
                      <li>• Sending important service updates and notifications</li>
                      <li>• Responding to your inquiries and support requests</li>
                      <li>• Sharing relevant product updates and new features</li>
                      <li>• Conducting surveys and gathering feedback</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-warning" />
                  Data Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  We implement industry-standard security measures to protect your personal information:
                </p>
                <ul className="text-gray-600 space-y-2 ml-4">
                  <li>• <strong>Encryption:</strong> All data is encrypted in transit and at rest using AES-256 encryption</li>
                  <li>• <strong>Authentication:</strong> We use secure authentication protocols and store passwords using bcrypt hashing</li>
                  <li>• <strong>Access Controls:</strong> Strict access controls limit who can view your personal information</li>
                  <li>• <strong>Regular Audits:</strong> We conduct regular security audits and vulnerability assessments</li>
                  <li>• <strong>Secure Infrastructure:</strong> Our servers are hosted in secure, SOC 2 compliant data centers</li>
                </ul>
              </CardContent>
            </Card>

            {/* Information Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-destructive" />
                  Information Sharing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
                </p>
                <ul className="text-gray-600 space-y-2 ml-4">
                  <li>• <strong>Within Your Community:</strong> Performance data and profiles are shared with your gym community as part of the service</li>
                  <li>• <strong>Service Providers:</strong> Trusted third-party services that help us operate our platform (with strict confidentiality agreements)</li>
                  <li>• <strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                  <li>• <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets (with user notification)</li>
                </ul>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-purple-500" />
                  Your Rights and Choices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="text-gray-600 space-y-2 ml-4">
                  <li>• <strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li>• <strong>Update:</strong> Correct or update your personal information through your account settings</li>
                  <li>• <strong>Delete:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                  <li>• <strong>Portability:</strong> Export your workout data in a machine-readable format</li>
                  <li>• <strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                  <li>• <strong>Restrict:</strong> Limit how we process your information in certain circumstances</li>
                </ul>
                <p className="text-gray-600 mt-4">
                  To exercise these rights, please contact us at privacy@acrossfit.com.
                </p>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2 text-accent" />
                  Data Retention
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy:
                </p>
                <ul className="text-gray-600 space-y-2 ml-4">
                  <li>• <strong>Active Accounts:</strong> We retain data while your account is active</li>
                  <li>• <strong>Workout Data:</strong> Performance and workout logs are retained to maintain historical records</li>
                  <li>• <strong>Closed Accounts:</strong> Data is anonymized or deleted within 30 days of account closure</li>
                  <li>• <strong>Legal Requirements:</strong> Some data may be retained longer to comply with legal obligations</li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-primary" />
                  Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Email:</strong> privacy@acrossfit.com</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  <p><strong>Address:</strong> ACrossFit Privacy Team<br />
                  123 Fitness Street<br />
                  San Francisco, CA 94105</p>
                </div>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-success" />
                  Policy Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
                  We will notify you of any material changes by:
                </p>
                <ul className="text-gray-600 space-y-1 ml-4">
                  <li>• Posting a notice on our website</li>
                  <li>• Sending an email notification to registered users</li>
                  <li>• Updating the "Last updated" date at the top of this policy</li>
                </ul>
                <p className="text-gray-600 mt-4">
                  Your continued use of ACrossFit after any changes indicates your acceptance of the updated Privacy Policy.
                </p>
              </CardContent>
            </Card>
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
