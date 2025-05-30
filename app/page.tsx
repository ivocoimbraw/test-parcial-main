import type { Metadata } from "next"
import AppLayout from "@/components/app-layout"

export const metadata: Metadata = {
  title: "Flutter UI Designer",
  description: "Visually design and export Flutter UI components",
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">Flutter UI Designer</span>
          </div>
          <nav className="flex items-center gap-4">
            <a
              href="https://github.com/yourusername/flutter-ui-designer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              GitHub
            </a>
            <a
              href="https://flutter.dev/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Flutter Docs
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <AppLayout />
      </main>
    </div>
  )
}
