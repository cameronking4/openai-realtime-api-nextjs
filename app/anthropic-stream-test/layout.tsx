import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anthropic Stream Test',
  description: 'Testing the Anthropic streaming functionality.',
};

export default function AnthropicStreamTestLayout({
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