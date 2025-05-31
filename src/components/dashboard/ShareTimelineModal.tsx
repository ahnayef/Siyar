
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, CheckCircle } from 'lucide-react';

interface ShareTimelineModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  timelineTitle: string;
  shareUrl: string;
}

export default function ShareTimelineModal({ isOpen, setIsOpen, timelineTitle, shareUrl }: ShareTimelineModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Link Copied!", description: "Timeline link copied to clipboard." });
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    } catch (err) {
      toast({ title: "Copy Failed", description: "Could not copy link to clipboard.", variant: "destructive" });
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="neo-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-archivo text-primary">Share "{timelineTitle}"</DialogTitle>
          <DialogDescription className="text-body-md text-muted-foreground pt-2">
            Anyone with this link can view this timeline if it's public.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label htmlFor="shareLink" className="text-card-foreground font-semibold font-inter">Shareable Link</Label>
          <div className="flex items-center space-x-2">
            <Input id="shareLink" value={shareUrl} readOnly className="neo-input flex-1" />
            <Button onClick={handleCopyLink} variant="outline" size="icon" className="neo-button-outline p-2 h-10 w-10">
              {copied ? <CheckCircle className="h-5 w-5 text-accent" /> : <Copy className="h-5 w-5" />}
              <span className="sr-only">Copy link</span>
            </Button>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" className="neo-button-outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
