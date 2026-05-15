import Nav from '@/components/Nav'
import TickerTape from '@/components/TickerTape'
import TabView from '@/components/TabView'
import Footer from '@/components/Footer'
import MixcloudPlayer from '@/components/MixcloudPlayer'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <>
      <Nav />
      <TickerTape />
      <TabView />
      <Footer />
      <MixcloudPlayer />
    </>
  )
}
