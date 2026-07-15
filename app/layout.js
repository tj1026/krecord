import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'The Kiley Record',
  description: 'The public record behind the rebrand.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
