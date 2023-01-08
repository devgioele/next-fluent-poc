import { Localized } from '@fluent/react';
import Footer from 'components/Footer';
import { serverSideTranslations } from 'lib/l10n';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}

const Home: NextPage = () => {
  return (
    <div className='flex h-full min-h-screen flex-col items-center justify-center bg-neutral-100'>
      <Head>
        <title>Next.js Fluent POC</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className='flex w-full flex-1 flex-col items-center justify-start gap-10 p-4 text-center sm:p-6 md:w-10/12 md:p-10 lg:w-9/12'>
        <Localized id='hello-world'>
          <p>
            level 1<p>level 2</p>
          </p>
        </Localized>
        <Localized id='hello-world' />
        <Localized id='testing-a-non-existing-id' />
        <Localized
          id='create-account'
          elems={{
            confirm: <button></button>,
            cancel: <a href='/' />,
          }}
        >
          <p />
        </Localized>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
