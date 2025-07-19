import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Building, MapPin, User, Globe, Phone, Mail, Check, ArrowRight } from "lucide-react";

export default function CreateCommunity() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Community Details
    gymName: '',
    location: '',
    description: '',
    yearsInBusiness: '',
    socialHandles: {
      instagram: '',
      facebook: '',
      website: ''
    },
    
    // Manager Details
    managerName: '',
    managerEmail: '',
    managerPhone: '',
    managerBio: '',
    
    // Class Schedule
    weekdaySchedule: '',
    weekendSchedule: '',
    specialPrograms: '',
    
    // Additional Info
    facilities: '',
    equipment: '',
    specialties: '',
    pricing: ''
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const validateCurrentStep = () => {
    setError('');
    
    switch (step) {
      case 1:
        if (!formData.gymName || !formData.location) {
          setError('Please fill in all required fields');
          return false;
        }
        break;
      case 2:
        if (!formData.managerName || !formData.managerEmail || !formData.managerPhone) {
          setError('Please fill in all manager contact details');
          return false;
        }
        break;
      case 3:
        if (!formData.weekdaySchedule) {
          setError('Please provide at least weekday class schedule');
          return false;
        }
        break;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Community created:', formData);
      
      // Redirect to success page or admin console
      window.location.href = '/admin';
      
    } catch (err) {
      setError('Failed to create community. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Building className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Community</h1>
          <p className="text-gray-600">
            Set up your CrossFit gym or fitness community on ACrossFit platform
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Community Information'}
              {step === 2 && 'Manager Details'}
              {step === 3 && 'Class Schedule'}
              {step === 4 && 'Review & Submit'}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {step === 1 && 'Tell us about your gym or fitness community'}
              {step === 2 && 'Community manager contact information'}
              {step === 3 && 'Set up your class schedule and programs'}
              {step === 4 && 'Review your information before creating the community'}
            </p>
          </CardHeader>
          
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="gymName">Gym/Community Name *</Label>
                  <Input
                    id="gymName"
                    value={formData.gymName}
                    onChange={(e) => setFormData(prev => ({...prev, gymName: e.target.value}))}
                    placeholder="CrossFit Downtown"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                    placeholder="New York, NY"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Community Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                    placeholder="Describe your community's mission, values, and what makes it special..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="yearsInBusiness">Years in Business</Label>
                  <Input
                    id="yearsInBusiness"
                    value={formData.yearsInBusiness}
                    onChange={(e) => setFormData(prev => ({...prev, yearsInBusiness: e.target.value}))}
                    placeholder="5"
                    className="mt-1"
                    type="number"
                  />
                </div>

                <Separator />

                <div>
                  <Label>Social Media & Website (Optional)</Label>
                  <div className="space-y-3 mt-2">
                    <Input
                      value={formData.socialHandles.instagram}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialHandles: {...prev.socialHandles, instagram: e.target.value}
                      }))}
                      placeholder="@yourgym"
                    />
                    <Input
                      value={formData.socialHandles.facebook}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialHandles: {...prev.socialHandles, facebook: e.target.value}
                      }))}
                      placeholder="facebook.com/yourgym"
                    />
                    <Input
                      value={formData.socialHandles.website}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialHandles: {...prev.socialHandles, website: e.target.value}
                      }))}
                      placeholder="https://yourgym.com"
                      type="url"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Alert>
                  <User className="h-4 w-4" />
                  <AlertDescription>
                    The community manager will have full access to manage members, workouts, and community settings.
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="managerName">Manager Full Name *</Label>
                  <Input
                    id="managerName"
                    value={formData.managerName}
                    onChange={(e) => setFormData(prev => ({...prev, managerName: e.target.value}))}
                    placeholder="John Smith"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="managerEmail">Manager Email Address *</Label>
                  <Input
                    id="managerEmail"
                    type="email"
                    value={formData.managerEmail}
                    onChange={(e) => setFormData(prev => ({...prev, managerEmail: e.target.value}))}
                    placeholder="john@crossfitdowntown.com"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="managerPhone">Manager Phone Number *</Label>
                  <Input
                    id="managerPhone"
                    type="tel"
                    value={formData.managerPhone}
                    onChange={(e) => setFormData(prev => ({...prev, managerPhone: e.target.value}))}
                    placeholder="+1 (555) 123-4567"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="managerBio">Manager Bio (Optional)</Label>
                  <Textarea
                    id="managerBio"
                    value={formData.managerBio}
                    onChange={(e) => setFormData(prev => ({...prev, managerBio: e.target.value}))}
                    placeholder="Tell us about the manager's experience, certifications, and background..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="weekdaySchedule">Weekday Class Schedule *</Label>
                  <Textarea
                    id="weekdaySchedule"
                    value={formData.weekdaySchedule}
                    onChange={(e) => setFormData(prev => ({...prev, weekdaySchedule: e.target.value}))}
                    placeholder="Monday-Friday:&#10;6:00 AM - Early Bird&#10;9:00 AM - Morning Class&#10;12:00 PM - Lunch Class&#10;6:00 PM - Evening Class&#10;7:00 PM - Advanced Class"
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="weekendSchedule">Weekend Class Schedule</Label>
                  <Textarea
                    id="weekendSchedule"
                    value={formData.weekendSchedule}
                    onChange={(e) => setFormData(prev => ({...prev, weekendSchedule: e.target.value}))}
                    placeholder="Saturday:&#10;8:00 AM - Weekend Warrior&#10;10:00 AM - Open Gym&#10;&#10;Sunday:&#10;10:00 AM - Community WOD"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="specialPrograms">Special Programs</Label>
                  <Textarea
                    id="specialPrograms"
                    value={formData.specialPrograms}
                    onChange={(e) => setFormData(prev => ({...prev, specialPrograms: e.target.value}))}
                    placeholder="Foundations Course, Olympic Lifting Club, Nutrition Coaching, Personal Training..."
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="facilities">Facilities & Equipment</Label>
                  <Textarea
                    id="facilities"
                    value={formData.facilities}
                    onChange={(e) => setFormData(prev => ({...prev, facilities: e.target.value}))}
                    placeholder="3000 sq ft training space, full Olympic lifting platform, assault bikes, rowers, complete set of dumbbells..."
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                {/* Review Community Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Community Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div><strong>Name:</strong> {formData.gymName}</div>
                    <div><strong>Location:</strong> {formData.location}</div>
                    {formData.description && <div><strong>Description:</strong> {formData.description}</div>}
                    {formData.yearsInBusiness && <div><strong>Years in Business:</strong> {formData.yearsInBusiness}</div>}
                  </div>
                </div>

                {/* Review Manager Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Manager Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div><strong>Name:</strong> {formData.managerName}</div>
                    <div><strong>Email:</strong> {formData.managerEmail}</div>
                    <div><strong>Phone:</strong> {formData.managerPhone}</div>
                    {formData.managerBio && <div><strong>Bio:</strong> {formData.managerBio}</div>}
                  </div>
                </div>

                {/* Review Schedule */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Class Schedule</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div>
                      <strong>Weekday Schedule:</strong>
                      <pre className="mt-1 text-sm whitespace-pre-wrap">{formData.weekdaySchedule}</pre>
                    </div>
                    {formData.weekendSchedule && (
                      <div>
                        <strong>Weekend Schedule:</strong>
                        <pre className="mt-1 text-sm whitespace-pre-wrap">{formData.weekendSchedule}</pre>
                      </div>
                    )}
                  </div>
                </div>

                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    By creating this community, you agree to our Terms of Service and will receive an email confirmation with next steps.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6 pt-6 border-t">
              <div>
                {step > 1 && (
                  <Button variant="outline" onClick={handlePrevious}>
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex space-x-3">
                {step < totalSteps ? (
                  <Button onClick={handleNext}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="min-w-32"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Community'}
                  </Button>
                )}
              </div>
            </div>

            {/* Back to Home Link */}
            <div className="text-center mt-6 pt-4 border-t">
              <Link href="/" className="text-sm text-gray-500 hover:text-primary">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">LIMITED TIME</Badge>
              Special Launch Pricing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">FREE</div>
              <div className="text-gray-600">All tiers are currently free during our launch period</div>
              <div className="text-sm text-gray-500">Support unlimited athletes and full feature access</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}