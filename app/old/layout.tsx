import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Old Home Page',
  description: 'The original home page of the application.',
};

export default function OldLayout({
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