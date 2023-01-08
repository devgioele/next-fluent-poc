import {
  LocalizationProvider,
  ReactLocalization,
  MarkupParser,
} from '@fluent/react';
import { AppProps } from 'next/app';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { FluentBundle, FluentResource } from '@fluent/bundle';
import * as cheerio from 'cheerio';
import type { AnyNode } from 'cheerio';

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

/** Make all keys of T optional except for K */
type RequiredBy<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

type FluentNode = RequiredBy<Node, 'nodeName' | 'textContent'>;

/** @see https://dom.spec.whatwg.org/#dom-node-nodetype */
const toNodeName = (nodeType: 1 | 9 | 4 | 3 | 8): string => {};

const toDomNode = (cheerioNode: AnyNode): FluentNode => ({
  nodeName: toNodeName(cheerioNode.cloneNode.nodeType),
  textContent: '',
});

const parseMarkup: MarkupParser = (str) => {
  const $ = cheerio.load(str);
  // TODO: How can we extract all elements in the form of <element>content</element>
  // or <element /> and return an array of FluentNode?
  return $('');
};

/** Pretend to have parsed HTML markup, but in reality disabling the
whole ReactOverlays feature.
*/
//const parseMarkup: MarkupParser = (str) => [
//{
//nodeName: '#text',
//textContent: str.toUpperCase(),
//} as Node,
//];

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
