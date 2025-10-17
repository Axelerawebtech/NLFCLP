import { ThemeContextProvider } from '../contexts/ThemeContext'
import { LanguageProvider } from '../contexts/LanguageContext'
import NotificationDisplay from '../components/NotificationDisplay'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <ThemeContextProvider>
        <Component {...pageProps} />
        <NotificationDisplay />
      </ThemeContextProvider>
    </LanguageProvider>
  )
}
