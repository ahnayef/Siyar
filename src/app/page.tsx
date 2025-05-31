import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, BarChart, Users } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 text-center p-4 overflow-hidden">
      <header className="container mx-auto py-12 md:py-20">
        <h1 className="text-5xl md:text-7xl font-extrabold text-primary mb-6 font-headline">
          Welcome to ChronoFlow
        </h1>
        <p className="text-xl md:text-2xl text-foreground/80 mb-10 max-w-2xl mx-auto">
          The ultimate timeline management tool with a bold, expressive neo-brutalist UI.
          Organize your academic or personal projects with style and precision.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button size="lg" asChild className="neo-button text-lg px-8 py-6">
            <Link href="/signup">Get Started Free</Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="neo-button bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground text-lg px-8 py-6">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </header>

      <section className="container mx-auto py-12 md:py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 font-headline">Why ChronoFlow?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 neo-card rounded-lg">
            <Zap className="h-12 w-12 text-accent mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Blazing Fast UI</h3>
            <p className="text-foreground/70">
              Experience a snappy, responsive interface built with Next.js and modern web technologies.
            </p>
          </div>
          <div className="p-6 neo-card rounded-lg">
            <BarChart className="h-12 w-12 text-accent mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Powerful Timelines</h3>
            <p className="text-foreground/70">
              Create, manage, and share public or private timelines with detailed events and countdowns.
            </p>
          </div>
          <div className="p-6 neo-card rounded-lg">
            <Users className="h-12 w-12 text-accent mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">AI-Powered Scheduling</h3>
            <p className="text-foreground/70">
              Leverage smart suggestions for event scheduling to optimize your workflow.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-12 md:py-20">
        <div className="neo-card rounded-lg p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2 text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-headline">Visualize Your Success</h2>
            <p className="text-lg text-foreground/80 mb-6">
              ChronoFlow's unique neo-brutalist design isn't just about looks. It provides clarity and focus, helping you stay on top of your tasks and deadlines.
            </p>
            <Button size="lg" asChild className="neo-button">
              <Link href="/signup">Start Planning Now</Link>
            </Button>
          </div>
          <div className="md:w-1/2">
            <Image
              src="https://placehold.co/600x400.png"
              alt="Timeline preview"
              data-ai-hint="abstract timeline"
              width={600}
              height={400}
              className="rounded-md border-2 border-foreground shadow-neo"
            />
          </div>
        </div>
      </section>

      <footer className="py-8 text-foreground/60 text-sm">
        © {new Date().getFullYear()} ChronoFlow. All rights reserved.
      </footer>
    </div>
  );
}
