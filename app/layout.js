import "./globals.css";

export const metadata = {
  title: "FIFA World Cup 2026",
  description: "World Cup game prototype",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
