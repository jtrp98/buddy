import type { SVGProps } from "react";

export type OrnamentName =
  | "holly"
  | "star"
  | "bauble"
  | "pine"
  | "flourish"
  | "horn"
  | "tree"
  | "quill"
  | "letters"
  | "mailbox";

interface OrnamentProps extends SVGProps<SVGSVGElement> {
  name: OrnamentName;
}

/**
 * Engraved 1950s line-art SVG ornaments in single ink (`currentColor`).
 */
export function Ornament({ name, className = "h-6 w-6", ...rest }: OrnamentProps) {
  switch (name) {
    case "holly":
      return (
        <svg viewBox="0 0 48 32" fill="none" aria-hidden="true" className={className} {...rest}>
          <path
            d="M23 18C18 11 11 9 5 11c2 3 2 6-1 8 4 1 6 3 6 6 5-3 9-3 13-7Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M22 18C16 16 11 15 6 16" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          <path
            d="M25 18c5-7 12-9 18-7-2 3-2 6 1 8-4 1-6 3-6 6-5-3-9-3-13-7Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path d="M26 18c6-2 11-3 16-2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          <circle cx="24" cy="18" r="2.6" fill="currentColor" />
          <circle cx="20.5" cy="22" r="2.2" fill="currentColor" opacity="0.88" />
          <circle cx="27.5" cy="22" r="2.2" fill="currentColor" opacity="0.88" />
        </svg>
      );

    case "star":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className} {...rest}>
          <path
            d="M16 3l2.6 9.4L28 15l-9.4 2.6L16 27l-2.6-9.4L4 15l9.4-2.6L16 3Z"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
          <path d="M9.5 8.5l2.5 2.5M22.5 8.5L20 11M9.5 21.5L12 19M22.5 21.5L20 19" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          <circle cx="16" cy="15" r="1.5" fill="currentColor" />
        </svg>
      );

    case "bauble":
      return (
        <svg viewBox="0 0 32 36" fill="none" aria-hidden="true" className={className} {...rest}>
          <circle cx="16" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.25" />
          <rect x="13" y="6.5" width="6" height="3.2" rx="0.8" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="16" cy="21" r="10.5" stroke="currentColor" strokeWidth="1.35" />
          <path d="M7 17.5c3 2.2 15 2.2 18 0M6.8 24c3.2-2.2 15.2-2.2 18.4 0" stroke="currentColor" strokeWidth="1.1" />
          <path d="M12 21l1.5-1.8 1.5 1.8 1.5-1.8 1.5 1.8 1.5-1.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "pine":
      return (
        <svg viewBox="0 0 40 28" fill="none" aria-hidden="true" className={className} {...rest}>
          <path d="M4 22C13 18 23 12 34 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path
            d="M11 19l-2-6M15 17l-1-7M20 14l-1-7M25 11l0-6M30 8l1-5M13 18l5 3M19 15l5 3M25 12l5 2"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <ellipse cx="14" cy="21" rx="2.6" ry="3.5" transform="rotate(-25 14 21)" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );

    case "flourish":
      return (
        <svg viewBox="0 0 80 20" fill="none" aria-hidden="true" className={className} {...rest}>
          <path
            d="M4 10c8 0 11-5 18-5 4 0 6 2.5 6 5s-2.5 4-4.5 4-3-1.5-2.5-3M76 10c-8 0-11-5-18-5-4 0-6 2.5-6 5s2.5 4 4.5 4 3-1.5 2.5-3"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path d="M40 3l2.2 4.8L47 10l-4.8 2.2L40 17l-2.2-4.8L33 10l4.8-2.2L40 3Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        </svg>
      );

    case "horn":
      return (
        <svg viewBox="0 0 40 28" fill="none" aria-hidden="true" className={className} {...rest}>
          <path
            d="M6 15h8c3 0 5-6 9-6s5 3.5 5 6-2 6-5 6-6-6-9-6H6l-2-2v4l2-2Z"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
          <path d="M28 15l8-4v8l-8-4Z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
          <path d="M16 17c-1 4 2 6 5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );

    case "tree":
      return (
        <svg viewBox="0 0 36 42" fill="none" aria-hidden="true" className={className} {...rest}>
          <path d="M18 4l1.4 3 3.1.5-2.2 2.2.5 3.1L18 11.4l-2.8 1.4.5-3.1-2.2-2.2 3.1-.5L18 4Z" stroke="currentColor" strokeWidth="1.15" strokeLinejoin="round" />
          <path
            d="M18 13l-6 7h3.5L10 27h4.5L9 34h18l-5.5-7H26l-5.5-7H24l-6-7Z"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
          <rect x="16" y="34" width="4" height="5" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="16" cy="23" r="1" fill="currentColor" />
          <circle cx="20.5" cy="29.5" r="1" fill="currentColor" />
          <circle cx="14.5" cy="30.5" r="1" fill="currentColor" />
        </svg>
      );

    case "quill":
      return (
        <svg viewBox="0 0 48 44" fill="none" aria-hidden="true" className={className} {...rest}>
          <rect x="7" y="14" width="24" height="24" rx="1.5" stroke="currentColor" strokeWidth="1.35" />
          <path d="M11 21h12M11 26h14M11 31h9" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
          <path
            d="M27 29c2-8 7-17 15-23-1 9-5 17-12 21l-3 2Z"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
          <path d="M27 29l-2 4" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
        </svg>
      );

    case "letters":
      return (
        <svg viewBox="0 0 48 44" fill="none" aria-hidden="true" className={className} {...rest}>
          <rect x="6" y="13" width="28" height="20" rx="1.5" transform="rotate(-5 6 13)" stroke="currentColor" strokeWidth="1.25" />
          <rect x="12" y="17" width="30" height="20" rx="1.5" fill="var(--color-paper)" stroke="currentColor" strokeWidth="1.35" />
          <path d="M12.5 18l14.5 10L41.5 18" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
          <circle cx="27" cy="26" r="2.8" fill="currentColor" />
        </svg>
      );

    case "mailbox":
      return (
        <svg viewBox="0 0 48 44" fill="none" aria-hidden="true" className={className} {...rest}>
          <path
            d="M12 28V16a8 8 0 0 1 8-8h11a7 7 0 0 1 7 7v13H12Z"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
          <path d="M20 8a8 8 0 0 1 8 8v12" stroke="currentColor" strokeWidth="1.2" />
          <path d="M22 28v11M26 28v11" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
          <path d="M32 15v-5h4v2.5h-4" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
          <path d="M16 17h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="10" cy="8" r="1" fill="currentColor" />
          <circle cx="41" cy="9" r="1.2" fill="currentColor" />
          <circle cx="39" cy="22" r="1" fill="currentColor" />
        </svg>
      );
  }
}
