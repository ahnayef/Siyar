import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, BarChart, Users } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground text-center p-4 overflow-hidden">
      <header className="container mx-auto py-12 md:py-20">
        <h1 className="text-5xl md:text-7xl font-extrabold text-primary mb-6 font-headline">
          ChronoFlow
        </h1>
        <p className="text-xl md:text-2xl text-foreground/80 mb-10 max-w-3xl mx-auto">
          Visualize your projects with razor-sharp clarity. Neo-brutalist timelines for ultimate focus and impact.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button size="lg" asChild className="neo-button text-lg px-8 py-6">
            <Link href="/signup">Get Started Free</Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="neo-button bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] text-lg px-8 py-6">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </header>

      <section className="container mx-auto py-12 md:py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-12 font-headline">Why ChronoFlow?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 neo-card rounded-lg">
            <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2 text-primary">Raw Power UI</h3>
            <p className="text-foreground/70">
              No fluff. Just a lightning-fast, brutalist interface built for speed and clarity.
            </p>
          </div>
          <div className="p-6 neo-card rounded-lg">
            <BarChart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2 text-primary">Hardcore Timelines</h3>
            <p className="text-foreground/70">
              Forge public or private timelines. Hammer out events. Crush your deadlines.
            </p>
          </div>
          <div className="p-6 neo-card rounded-lg">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2 text-primary">AI-Assisted Edge</h3>
            <p className="text-foreground/70">
              Smart scheduling suggestions to cut through the noise and optimize your flow.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-12 md:py-20">
        <div className="neo-card rounded-lg p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2 text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6 font-headline">Visualize. Execute. Dominate.</h2>
            <p className="text-lg text-foreground/80 mb-6">
              ChronoFlow's neo-brutalist design isn't a trend—it's a statement. Maximum information, zero distraction. Stay sharp.
            </p>
            <Button size="lg" asChild className="neo-button">
              <Link href="/signup">Plan Your Conquest</Link>
            </Button>
          </div>
          <div className="md:w-1/2">
            <Image
              src="https://placehold.co/600x400/18181B/FCEE06.png"
              alt="Abstract timeline visualization"
              data-ai-hint="digital abstract"
              width={600}
              height={400}
              className="rounded-md border-2 border-primary shadow-[4px_4px_0px_0px_hsl(var(--primary))]"
            />
          </div>
        </div>
      </section>

      <footer className="py-8 text-muted-foreground text-sm">
        © {new Date().getFullYear()} ChronoFlow. Built with raw determination.
      </footer>
    </div>
  );
}
