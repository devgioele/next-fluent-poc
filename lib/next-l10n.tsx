import {
  LocalizationProvider,
  ReactLocalization,
  MarkupParser,
} from '@fluent/react';
import { AppProps } from 'next/app';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { FluentBundle, FluentResource } from '@fluent/bundle';

// A generator function responsible for building the sequence
// of FluentBundle instances in the order of user's language
// preferences.
function* lazilyParsedBundles(fetchedMessages: Array<[string, string]>) {
  for (const [locale, messages] of fetchedMessages) {
    let resource = new FluentResource(messages);
    let bundle = new FluentBundle(locale);
    bundle.addResource(resource);
    yield bundle;
  }
}

/** Pretend to have parsed HTML markup, but in reality disabling the
whole ReactOverlays feature.
*/
const parseMarkup: MarkupParser = (str) => [
  {
    nodeName: '#text',
    textContent: str.toUpperCase(),
  } as Node,
];

export const appWithLocalization = <Props extends AppProps>(
  WrappedComponent: React.ComponentType<Props>
) => {
  const AppWithTranslation = (
    props: Props & { pageProps: Props['pageProps'] }
  ) => {
    const { l10nMessages } = props.pageProps;
    let bundles = lazilyParsedBundles(l10nMessages);
    const l10n = new ReactLocalization(bundles, parseMarkup);
    return l10n ? (
      <LocalizationProvider l10n={l10n}>
        <WrappedComponent {...props} />
      </LocalizationProvider>
    ) : (
      <WrappedComponent {...props} />
    );
  };

  // Copy any static methods WrappedComponent had to the new AppWithTranslation
  // to not break compatibility with other wrappers that might be used in conjunction
  // https://reactjs.org/docs/higher-order-components.html#static-methods-must-be-copied-over
  return hoistNonReactStatics(AppWithTranslation, WrappedComponent);
};
