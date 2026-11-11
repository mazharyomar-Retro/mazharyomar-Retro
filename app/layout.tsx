import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Mohamed Azhar Yusuf Omar — Full-Stack Developer",
  description: "Portfolio of Mohamed Azhar Yusuf Omar, a full-stack developer building thoughtful, database-driven products from Johannesburg, South Africa.",
  applicationName: "Azhar Omar Portfolio",
  openGraph: {
    title: "Mohamed Azhar Yusuf Omar — Full-Stack Developer",
    description: "Building useful things for the real world.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#0b0e12",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
