import type { DetailedHTMLProps, HTMLAttributes } from 'react'

type WiredElementProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  elevation?: number
  disabled?: boolean
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'wired-button': WiredElementProps
      'wired-card': WiredElementProps
    }
  }
}

export {}
