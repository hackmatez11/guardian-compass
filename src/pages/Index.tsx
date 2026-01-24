import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight, BarChart3, Users, Shield } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <nav className="relative z-10 container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl">
              <GraduationCap className="h-6 w-6 text-accent" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">EduPredict</span>
          </div>
          <Link to="/auth">
            <Button variant="outline">Sign In</Button>
          </Link>
        </nav>

        <div className="relative z-10 container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight mb-6 animate-fade-in">
            AI-Powered <span className="text-accent">Student Success</span>
            <br />Prediction System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in-up">
            Identify at-risk students early and provide targeted counseling to improve retention and academic outcomes.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 animate-scale-in">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: BarChart3, title: 'Predictive Analytics', desc: 'AI-driven risk assessment for early intervention' },
            { icon: Users, title: 'Counseling Management', desc: 'Track sessions and recommendations efficiently' },
            { icon: Shield, title: 'Secure & Private', desc: 'Role-based access with data protection' },
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-xl bg-card border border-border/50 hover:border-accent/30 transition-all">
              <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4">
                <feature.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-display font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;