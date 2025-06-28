
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, BarChart3, Users, Workflow, Calendar, Clock, Share2, CheckCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Siyar } from '@/constant/images';
import Logo from '@/Icon/Logo';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b-4 border-black">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 z-0"></div>
        <div className="container mx-auto py-20 md:py-28 px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-archivo font-bold mb-6 leading-tight">
              <span className="bg-primary text-primary-foreground px-2">Visualize</span> Your Time. <br />
              <span className="bg-black text-white px-2">Organize</span> Your Life.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto font-inter">
              The timeline manager for today's creative minds. Neo-brutalist clarity for your academic and personal commitments.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button size="lg" asChild className="neo-button text-lg px-8 py-6 font-bold w-full sm:w-auto">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="neo-button-outline text-lg px-8 py-6 font-bold w-full sm:w-auto">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-1 left-0 w-full h-8 bg-wave-pattern opacity-10 z-0"></div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-archivo font-bold mb-4 text-center">Why Choose <span className="text-primary">Siyar</span>?</h2>
          <p className="text-xl text-muted-foreground mb-16 text-center max-w-2xl mx-auto">
            Designed for students, creators, and professionals who value clarity and focus.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-background border-4 border-black shadow-brutal transition-transform duration-300 hover:-translate-y-2">
              <Calendar className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-2xl font-archivo font-bold mb-3 text-foreground">Visual Timelines</h3>
              <p className="text-muted-foreground mb-4">
                Create striking, visual representations of your projects, academic terms, or any time-based commitments.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" /> Multiple timeline views
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" /> Clean, neo-brutalist UI
                </li>
              </ul>
            </div>
            <div className="p-8 bg-background border-4 border-black shadow-brutal transition-transform duration-300 hover:-translate-y-2">
              <Clock className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-2xl font-archivo font-bold mb-3 text-foreground">Smart Planning</h3>
              <p className="text-muted-foreground mb-4">
                AI-assisted planning tools help you create balanced schedules and avoid deadline clustering.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" /> Deadline warnings
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" /> Visual countdown timers
                </li>
              </ul>
            </div>
            <div className="p-8 bg-background border-4 border-black shadow-brutal transition-transform duration-300 hover:-translate-y-2">
              <Share2 className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-2xl font-archivo font-bold mb-3 text-foreground">Seamless Sharing</h3>
              <p className="text-muted-foreground mb-4">
                Share timelines with teammates, classmates, or anyone who needs to stay in sync with your schedule.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" /> Privacy controls
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" /> One-click timeline sharing
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-archivo font-bold mb-6">
                Neo-Brutalist <span className="text-primary">Precision</span> for Your Time
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Siyar strips away the unnecessary and focuses on what matters: clear visualization of your commitments, deadlines, and milestones.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center font-bold rounded-sm flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-bold text-lg">Create your timeline</h3>
                    <p className="text-muted-foreground">Name it, customize it, make it yours.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center font-bold rounded-sm flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-bold text-lg">Add important events</h3>
                    <p className="text-muted-foreground">Assignments, deadlines, meetings, or milestones.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center font-bold rounded-sm flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-bold text-lg">Visualize and share</h3>
                    <p className="text-muted-foreground">Get clarity and keep everyone in sync.</p>
                  </div>
                </div>
              </div>
              <Button asChild className="neo-button text-lg px-6 py-3 font-medium">
                <Link href="/signup">Start Creating <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="md:w-1/2 order-1 md:order-2">
              <div className="relative">
                <Image
                  src="/Siyar.png"
                  alt="Siyar Timeline Manager"
                  width={600}
                  height={400}
                  className="rounded-lg border-4 border-black shadow-brutal relative z-10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30 border-y-4 border-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-archivo font-bold mb-6">
            Ready to <span className="text-primary">Upgrade</span> Your Planning Game?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
            Join Siyar today and transform how you manage your time. It's completely free, today and always.
          </p>
          <Button asChild size="lg" className="neo-button text-lg px-8 py-6 font-bold">
            <Link href="/signup">Create Your First Timeline</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            {/* Logo */}
            <div className="flex items-center text-foreground mb-6">
              <Logo className="h-5 w-5 mr-2" />
              <span className="font-archivo font-medium">Siyar</span>
            </div>
            
            {/* Navigation */}
            <div className="flex gap-6 mb-6">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Login
              </Link>
              <Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Sign Up
              </Link>
            </div>
            
            {/* Copyright & Credit */}
            <div className="text-xs text-muted-foreground flex flex-col items-center gap-2">
              <div>
                © {new Date().getFullYear() === 2023 ? '2023' : `2023-${new Date().getFullYear()}`} Siyar. 
                Free forever.
              </div>
              <div className="flex items-center">
                <span>Designed by</span>
                <a 
                  href="https://github.com/ahnayef" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 hover:text-primary transition-colors inline-flex items-center"
                >
                  @AHNayef
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
