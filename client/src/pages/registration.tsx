import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Dumbbell, User, Phone, Briefcase, Weight, Ruler, Calendar, FileText } from "lucide-react";

const registrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username must be less than 50 characters"),
  phoneNumber: z.string().optional(),
  occupation: z.string().optional(),
  bodyWeight: z.string().optional(),
  bodyHeight: z.string().optional(),
  yearsOfExperience: z.string().optional(),
  bio: z.string().optional(),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function Registration() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      phoneNumber: "",
      occupation: "",
      bodyWeight: "",
      bodyHeight: "",
      yearsOfExperience: "",
      bio: "",
    },
  });

  const onSubmit = async (data: RegistrationForm) => {
    setIsSubmitting(true);
    try {
      const registrationData = {
        ...data,
        bodyWeight: data.bodyWeight ? parseFloat(data.bodyWeight) : undefined,
        bodyHeight: data.bodyHeight ? parseFloat(data.bodyHeight) : undefined,
        yearsOfExperience: data.yearsOfExperience ? parseInt(data.yearsOfExperience) : undefined,
      };

      await apiRequest("POST", "/api/auth/register", registrationData);
      
      toast({
        title: "Registration Complete!",
        description: "Welcome to ACrossFit! Your account has been set up successfully.",
      });
      
      // Refresh the page to trigger auth check
      window.location.reload();
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Dumbbell className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold text-secondary">ACrossFit</span>
          </div>
          <CardTitle className="text-2xl">Complete Your Registration</CardTitle>
          <CardDescription>
            Fill in your details to get started with your CrossFit journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Username *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Occupation
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your occupation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="yearsOfExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Years of Experience
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Years in CrossFit" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bodyWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Weight className="h-4 w-4" />
                        Body Weight (kg)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="Enter your weight" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bodyHeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Body Height (cm)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="Enter your height" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Bio
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about yourself and your fitness goals..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Share your fitness journey and goals with the community
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Completing Registration..." : "Complete Registration"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}