import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Add a script to handle extension errors */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent extension errors from breaking the app
              window.addEventListener('error', function(event) {
                if (event.error && event.error.stack && event.error.stack.includes('egjidjbpglichdcondbcbdnbeeppgdph')) {
                  event.preventDefault();
                  console.warn('Caught extension error, preventing it from breaking the app');
                  return true;
                }
                return false;
              }, true);
              
              // Override console.error to filter out extension errors
              const originalConsoleError = console.error;
              console.error = function() {
                const args = Array.from(arguments);
                const errorMessage = args.join(' ');
                if (errorMessage.includes('egjidjbpglichdcondbcbdnbeeppgdph')) {
                  return;
                }
                return originalConsoleError.apply(console, args);
              };
            `,
          }}
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
