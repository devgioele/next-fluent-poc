import 'styles/globals.css';
import type { AppProps } from 'next/app';
import { appWithLocalization } from 'lib/next-l10n';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default appWithLocalization(MyApp);
