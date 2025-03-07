import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anthropic Test',
  description: 'Testing the Anthropic API functionality.',
};

export default function AnthropicTestLayout({
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