import type { Metadata } from "next";
import { privateLinkMetadata } from "@/lib/site";

// Personal link: neutral preview card, never indexed.
export const metadata: Metadata = privateLinkMetadata();

export default function PrivateLinkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
