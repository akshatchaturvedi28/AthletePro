import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { User, Info, Check } from "lucide-react";

export default function UserSignUp() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    occupation: '',
    bodyWeight: '',
    bodyHeight: '',
    yearsOfExperience: '',
    bio: '',
    agreedToTerms: false,
    emailVerified: false,
    verificationCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (!formData.agreedToTerms) {
        setError('Please agree to the terms and privacy policy');
        return;
      }
      
      setError('');
      // Send verification code automatically
      try {
        await sendVerificationCode();
        setShowVerification(true);
      } catch (error) {
        setError('Failed to send verification code');
      }
      return;
    }

    if (showVerification) {
      // Handle email/phone verification
      setIsLoading(true);
      try {
        // Verify the code with the backend
        const response = await fetch('/api/verification/verify-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: formData.email, // Use email as primary identifier
            code: formData.verificationCode,
            type: 'email'
          })
        });
        
        const result = await response.json();
        
        if (response.ok) {
          setFormData(prev => ({ ...prev, emailVerified: true }));
          setShowVerification(false);
          setStep(2);
        } else {
          throw new Error(result.error || 'Verification failed');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid verification code');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    // Final submission
    setIsLoading(true);
    setError('');

    try {
      // Registration logic would go here
      console.log('User registration:', formData);
      
      // For now, redirect to sign in
      window.location.href = '/signin';
      
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    setIsLoading(true);
    try {
      const endpoint = '/api/verification/send-email-code';
      const data = { email: formData.email };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(`✅ Verification code sent to your email!\n\nIf SendGrid is not configured, check the server console logs for the demo verification code.`);
        console.log(`Verification code sent to ${formData.email}`);
      } else {
        throw new Error(result.error || 'Failed to send code');
      }
      
    } catch (error) {
      console.error('Verification error:', error);
      alert(`❌ Failed to send verification code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Join ACrossFit
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account - It's completely FREE
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-center">
              {step === 1 && 'Create Account'}
              {step === 2 && 'Personal Information'}
              {step === 3 && 'Fitness Profile'}
            </CardTitle>
            <div className="flex justify-center space-x-2">
              <div className={`w-8 h-1 rounded ${step >= 1 ? 'bg-primary' : 'bg-gray-300'}`} />
              <div className={`w-8 h-1 rounded ${step >= 2 ? 'bg-primary' : 'bg-gray-300'}`} />
              <div className={`w-8 h-1 rounded ${step >= 3 ? 'bg-primary' : 'bg-gray-300'}`} />
            </div>
          </CardHeader>
          <CardContent>
            {showVerification ? (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium">Verify Your Account</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    We've sent a verification code to your email
                  </p>
                </div>

                <div>
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    value={formData.verificationCode}
                    onChange={(e) => setFormData(prev => ({...prev, verificationCode: e.target.value}))}
                    placeholder="123456"
                    className="mt-1 text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={sendVerificationCode}
                  disabled={isLoading}
                  className="w-full"
                >
                  Resend Email Code
                </Button>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleSubmit}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Verify Account'}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {step === 1 && (
                  <>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                        required
                        placeholder="you@example.com"
                        className="mt-1"
                      />
                    </div>



                    <div>
                      <Label htmlFor="password">
                        Password
                        <Info className="inline h-3 w-3 ml-1 text-gray-400" />
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                        required
                        className="mt-1"
                        minLength={8}
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
                        required
                        className="mt-1"
                        minLength={8}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.agreedToTerms}
                        onCheckedChange={(checked) => setFormData(prev => ({...prev, agreedToTerms: !!checked}))}
                      />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the{' '}
                        <Link href="/privacy" className="text-primary hover:underline">Terms of Service</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                      </Label>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                        required
                        placeholder="athlete123"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="occupation">Occupation (Optional)</Label>
                      <Input
                        id="occupation"
                        type="text"
                        value={formData.occupation}
                        onChange={(e) => setFormData(prev => ({...prev, occupation: e.target.value}))}
                        placeholder="Software Engineer"
                        className="mt-1"
                      />
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bodyWeight">Weight (lbs)</Label>
                        <Input
                          id="bodyWeight"
                          type="number"
                          value={formData.bodyWeight}
                          onChange={(e) => setFormData(prev => ({...prev, bodyWeight: e.target.value}))}
                          placeholder="150"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bodyHeight">Height (inches)</Label>
                        <Input
                          id="bodyHeight"
                          type="number"
                          value={formData.bodyHeight}
                          onChange={(e) => setFormData(prev => ({...prev, bodyHeight: e.target.value}))}
                          placeholder="70"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="yearsOfExperience">Years of CrossFit Experience</Label>
                      <Select onValueChange={(value) => setFormData(prev => ({...prev, yearsOfExperience: value}))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Complete Beginner</SelectItem>
                          <SelectItem value="0.5">Less than 6 months</SelectItem>
                          <SelectItem value="1">1 year</SelectItem>
                          <SelectItem value="2">2 years</SelectItem>
                          <SelectItem value="3">3+ years</SelectItem>
                          <SelectItem value="5">5+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio (Optional)</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({...prev, bio: e.target.value}))}
                        placeholder="Tell us about your fitness journey..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex space-x-3">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                  )}
                  
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : (step === 3 ? 'Create Account' : 'Next')}
                  </Button>
                </div>
              </form>
            )}

            {step === 1 && !showVerification && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/api/login'}
                  >
                    Continue with Google
                  </Button>
                  
                  <div className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/signin" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}