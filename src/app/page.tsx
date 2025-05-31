import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, BarChart3, Users } from 'lucide-react'; // Changed BarChart icon
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground text-center p-4 overflow-hidden">
      <header className="container mx-auto py-16 md:py-24">
        <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 font-headline">
          ChronoFlow
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
          Organize your world with timelines. Clear, focused, and built with neo-brutalist precision.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button size="lg" asChild className="neo-button text-lg px-8 py-3">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="neo-button-outline text-lg px-8 py-3">
            <Link href="/dashboard">My Dashboard</Link>
          </Button>
        </div>
      </header>

      <section className="container mx-auto py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 font-headline">Why ChronoFlow?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 neo-card">
            <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2 text-primary">Focused Design</h3>
            <p className="text-muted-foreground">
              A clean, neo-brutalist interface that cuts through the noise so you can focus.
            </p>
          </div>
          <div className="p-8 neo-card">
            <BarChart3 className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2 text-primary">Powerful Timelines</h3>
            <p className="text-muted-foreground">
              Craft detailed public or private timelines. Track events, manage deadlines.
            </p>
          </div>
          <div className="p-8 neo-card">
            <Users className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2 text-primary">AI Assistance</h3>
            <p className="text-muted-foreground">
              Smart scheduling suggestions to help you optimize your plans and flow.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-16 md:py-24">
        <div className="neo-card p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2 text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-headline">Visualize. Plan. Achieve.</h2>
            <p className="text-lg text-muted-foreground mb-8">
              ChronoFlow's design philosophy is simple: maximum clarity, zero distraction. Stay sharp, stay organized.
            </p>
            <Button size="lg" asChild className="neo-button px-10 py-3">
              <Link href="/signup">Create Your First Timeline</Link>
            </Button>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0">
            <Image
              src="https://placehold.co/600x400/F0F0F0/1A1A1A.png" 
              alt="Abstract timeline or project board"
              data-ai-hint="geometric abstract"
              width={600}
              height={400}
              className="rounded-md border-2 border-strong-border shadow-neo-light"
            />
          </div>
        </div>
      </section>

      <footer className="py-10 text-muted-foreground text-sm">
        © {new Date().getFullYear()} ChronoFlow. Built with clarity.
      </footer>
    </div>
  );
}
