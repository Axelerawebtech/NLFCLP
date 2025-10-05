import { ThemeContextProvider } from '../contexts/ThemeContext'
import { LanguageProvider } from '../contexts/LanguageContext'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <ThemeContextProvider>
        <Component {...pageProps} />
      </ThemeContextProvider>
    </LanguageProvider>
  )
}
