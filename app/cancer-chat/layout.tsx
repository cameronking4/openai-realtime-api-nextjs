import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Healing Check-in | Cancer Chat',
  description: 'A supportive chat interface for cancer patients to express their feelings and receive guidance.',
};

export default function CancerChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">{children}</main>
    </div>
  );
} 