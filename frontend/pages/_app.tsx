import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Cortexa AI - Cognitive Risk Assessment</title>
        <meta name="description" content="Cortexa AI - Cognitive Risk Assessment System" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}





