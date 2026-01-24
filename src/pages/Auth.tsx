import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, GraduationCap, Shield, Users, BookOpen } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(100),
  role: z.enum(['admin', 'counselor', 'student'], { message: "Please select a role" }),
});

type AppRole = 'admin' | 'counselor' | 'student';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<AppRole | ''>('');
  
  const { signIn, signUp, user, userRole } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  // Redirect if already authenticated
  if (user && userRole) {
    const dashboardPath = userRole === 'admin' ? '/admin' : 
                          userRole === 'counselor' ? '/counselor' : 
                          '/student';
    const from = location.state?.from?.pathname || dashboardPath;
    return <Navigate to={from} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validation = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
      if (!validation.success) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: validation.error.errors[0].message,
        });
        setIsLoading(false);
        return;
      }

      const { error } = await signIn(loginEmail, loginPassword);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message === 'Invalid login credentials' 
            ? 'Invalid email or password. Please try again.'
            : error.message,
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validation = signupSchema.safeParse({ 
        fullName: signupName, 
        email: signupEmail, 
        password: signupPassword,
        role: signupRole,
      });
      
      if (!validation.success) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: validation.error.errors[0].message,
        });
        setIsLoading(false);
        return;
      }

      const { error } = await signUp(signupEmail, signupPassword, signupName, signupRole as AppRole);
      
      if (error) {
        let message = error.message;
        if (message.includes('already registered')) {
          message = 'This email is already registered. Please log in instead.';
        }
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: message,
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Welcome to the Dropout Prediction System.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const roleIcons = {
    admin: <Shield className="h-4 w-4" />,
    counselor: <Users className="h-4 w-4" />,
    student: <BookOpen className="h-4 w-4" />,
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/20" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-accent/20 rounded-xl">
              <GraduationCap className="h-10 w-10 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">EduPredict</h1>
              <p className="text-primary-foreground/70 text-sm">AI-Powered Student Success</p>
            </div>
          </div>
          <h2 className="text-4xl font-display font-bold leading-tight mb-6">
            Empowering Student Success Through
            <span className="text-accent"> Early Intervention</span>
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Our AI-driven platform identifies at-risk students early, enabling targeted counseling and support to improve retention and academic outcomes.
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="bg-primary-foreground/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-accent">95%</div>
              <div className="text-sm text-primary-foreground/70">Prediction Accuracy</div>
            </div>
            <div className="bg-primary-foreground/10 rounded-xl p-4">
              <div className="text-3xl font-bold text-accent">40%</div>
              <div className="text-sm text-primary-foreground/70">Dropout Reduction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="p-3 bg-primary rounded-xl">
              <GraduationCap className="h-8 w-8 text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">EduPredict</h1>
              <p className="text-muted-foreground text-xs">AI-Powered Student Success</p>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-border/50 shadow-lg">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-display">Welcome back</CardTitle>
                  <CardDescription>Enter your credentials to access your dashboard</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card className="border-border/50 shadow-lg">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-display">Create an account</CardTitle>
                  <CardDescription>Join the platform to start tracking student success</CardDescription>
                </CardHeader>
                <form onSubmit={handleSignup}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-role">Role</Label>
                      <Select 
                        value={signupRole} 
                        onValueChange={(value: AppRole) => setSignupRole(value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="signup-role">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">
                            <div className="flex items-center gap-2">
                              {roleIcons.student}
                              <span>Student</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="counselor">
                            <div className="flex items-center gap-2">
                              {roleIcons.counselor}
                              <span>Counselor</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              {roleIcons.admin}
                              <span>Administrator</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" 
                      disabled={isLoading || !signupRole}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}