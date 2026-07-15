export const metadata = {
  title: 'The Kiley Record',
  description: 'The public record behind the rebrand.',
  icons: { icon: '/favicon.svg' }
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
