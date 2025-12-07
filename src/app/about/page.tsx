import { Metadata } from "next";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Share2,
  Layers,
  Lock,
  Users,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About | Siyar",
  description: "Learn more about Siyar and its features.",
  openGraph: {
    title: "About | Siyar",
    description: "Learn more about Siyar and its features.",
    url: "https://siyar.vercel.app/about",
    siteName: "Siyar",
    images: [
      {
        url: `/Siyar.png`,
        width: 1200,
        height: 630,
        alt: "About | Siyar",
      },
    ],
  },
};

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 max-w-5xl">
      {/* Hero Section */}
      <section className="mb-16 sm:mb-24">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div className="order-2 md:order-1">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-archivo font-bold mb-6 leading-tight">
              Visualize Your <span className="text-primary">Time</span>, Manage
              Your <span className="text-primary">Life</span>
            </h1>
            <p className="text-lg sm:text-xl mb-8 text-muted-foreground">
              Siyar is a timeline manager designed to help you visualize and
              manage your academic and personal commitments with neo-brutalist
              clarity.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="neo-button">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="neo-button-outline"
              >
                <Link href="/dashboard">View Demo</Link>
              </Button>
            </div>
          </div>
          <div className="order-1 md:order-2 relative h-64 sm:h-96 border-4 border-black shadow-brutal overflow-hidden bg-muted">
            <Image
              src="/Siyar.png"
              alt="Siyar Timeline Manager Screenshot"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16 sm:mb-24">
        <h2 className="text-3xl sm:text-4xl font-archivo font-bold mb-12 text-center">
          Features That <span className="text-primary">Simplify</span> Your Life
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div className="bg-background p-6 border-4 border-black shadow-brutal-sm">
            <div className="mb-4">
              <Calendar className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-archivo">
              Visual Timelines
            </h3>
            <p className="text-muted-foreground">
              Create clear, visual timelines for academic semesters, projects,
              or any time-based commitments.
            </p>
          </div>

          <div className="bg-background p-6 border-4 border-black shadow-brutal-sm">
            <div className="mb-4">
              <Clock className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-archivo">
              Countdown Tracking
            </h3>
            <p className="text-muted-foreground">
              See at a glance how much time remains until your important
              deadlines and events.
            </p>
          </div>

          <div className="bg-background p-6 border-4 border-black shadow-brutal-sm">
            <div className="mb-4">
              <Share2 className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-archivo">
              Easy Sharing
            </h3>
            <p className="text-muted-foreground">
              Share your timelines with classmates, team members, or anyone who
              needs to stay in sync.
            </p>
          </div>

          <div className="bg-background p-6 border-4 border-black shadow-brutal-sm">
            <div className="mb-4">
              <Layers className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-archivo">
              Multiple Timelines
            </h3>
            <p className="text-muted-foreground">
              Organize different aspects of your life with separate,
              easy-to-manage timelines.
            </p>
          </div>

          <div className="bg-background p-6 border-4 border-black shadow-brutal-sm">
            <div className="mb-4">
              <Lock className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-archivo">
              Privacy Controls
            </h3>
            <p className="text-muted-foreground">
              Choose whether your timelines are private or public with simple
              visibility controls.
            </p>
          </div>

          <div className="bg-background p-6 border-4 border-black shadow-brutal-sm">
            <div className="mb-4">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-archivo">
              Collaborative
            </h3>
            <p className="text-muted-foreground">
              Perfect for group projects, shared schedules, and team
              coordination.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-16 sm:mb-24">
        <h2 className="text-3xl sm:text-4xl font-archivo font-bold mb-12 text-center">
          How <span className="text-primary">Siyar</span> Works
        </h2>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 font-archivo">
                Create Your Timeline
              </h3>
              <p className="text-muted-foreground">
                Sign up for Siyar and create your first timeline. Name it, set
                visibility preferences, and you&apos;re ready to go.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 font-archivo">
                Add Important Events
              </h3>
              <p className="text-muted-foreground">
                Add key events, deadlines, and milestones to your timeline. Each
                event can include a title, description, and due date.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 font-archivo">
                Visualize & Share
              </h3>
              <p className="text-muted-foreground">
                Get a clear view of your upcoming events and deadlines. Share
                your timeline with others when needed for collaboration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <div className="bg-muted p-8 sm:p-12 border-4 border-black shadow-brutal">
          <h2 className="text-2xl md:text-3xl font-archivo font-bold mb-4">
            Ready to <span className="text-primary">Upgrade</span> Your Planning
            Game?
          </h2>
          <p className="text-base md:text-lg mb-8 max-w-2xl mx-auto text-muted-foreground">
            Join Siyar and transform how you manage your time. It's completely
            free, today and always. No subscriptions, no hidden costs, just a
            genuinely useful tool.
          </p>
          <Button asChild size="lg" className="neo-button">
            <Link href="/signup">Start Creating</Link>
          </Button>

          <div className="mt-8 flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Actually Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Full Access For Everyone</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span>Premium-Quality Features</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with updated date */}
      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <div className="text-xs text-muted-foreground flex flex-col items-center gap-2">
          <div>
            ©{" "}
            {new Date().getFullYear() === 2025
              ? "2025"
              : `2023-${new Date().getFullYear()}`}{" "}
            Siyar. Free forever.
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
      </footer>
    </div>
  );
}
