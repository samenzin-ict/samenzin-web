import React from 'react'

import { sansBody, serifHeading } from '@/fonts'

import './globals.css'

/*
 * Root layout for the public site. The font variables are attached here so
 * --font-serif-heading and --font-sans-body are available to the tokens in
 * globals.css.
 *
 * lang is nl because Dutch is the only active locale. When a second locale is
 * enabled this must come from the request, not from a constant.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${serifHeading.variable} ${sansBody.variable}`}>
      <body>{children}</body>
    </html>
  )
}
