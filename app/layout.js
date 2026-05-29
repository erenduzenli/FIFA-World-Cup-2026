import "./globals.css";

export const metadata = {
  title: "FIFA Dünya Kupası 2026",
  description: "Dünya Kupası oyun sitesi",
  icons: {
    icon: "/world-cup-logo.png",
    shortcut: "/world-cup-logo.png",
    apple: "/world-cup-logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
