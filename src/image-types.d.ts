/*
 * Types for static image imports (`import logo from '@/assets/brand/logo.png'`).
 *
 * next-env.d.ts carries the same reference, but it is gitignored and only
 * written by `next dev` or `next build`. CI type checks before it builds, so
 * without this file every image import fails there while passing locally.
 */
/// <reference types="next/image-types/global" />
