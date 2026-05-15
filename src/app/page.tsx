import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Services from '@/components/Services'
import Events from '@/components/Events'
import Testimonials from '@/components/Testimonials'
import BookingForm from '@/components/BookingForm'
import Footer from '@/components/Footer'

// Dynamic so Supabase queries run at request time, not build time
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Services />
        <Events />
        <Testimonials />
        <BookingForm />
      </main>
      <Footer />
    </>
  )
}
