import React from 'react'

import Navbar from '@/components/Navbar'

type Props = {
  children: React.ReactNode
}

export default function AppLayout({ children }: Props) {
  return (
    <div className="flex w-full flex-col min-h-screen bg-aovest-bg">
      <Navbar />
      {children}
    </div>
  )
}
