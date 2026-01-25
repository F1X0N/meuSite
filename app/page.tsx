import { Hero } from '@/components/content/Hero'
import { Highlights } from '@/components/sections/Highlights'
import { FeaturedCaseStudies } from '@/components/sections/FeaturedCaseStudies'
import { FeaturedBlog } from '@/components/sections/FeaturedBlog'
import { Experience } from '@/components/sections/Experience'
import { AIChat } from '@/components/sections/AIChat'
import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'

export default function HomePage() {
  return (
    <main>
      <Hero />
      
      {/* 🤖 AI CHAT — DESTAQUE MÁXIMO (DIFERENCIAL) */}
      <section id="ai-chat" className="scroll-mt-24 py-16 md:py-20 lg:py-24 bg-gradient-to-b from-background to-muted/30">
        <AIChat />
      </section>

      <section id="highlights" className="scroll-mt-24 py-16 md:py-20 lg:py-24">
        <Highlights />
      </section>

      <section id="featured-case-studies" className="scroll-mt-24 py-16 md:py-20 lg:py-24 bg-muted/30">
        <FeaturedCaseStudies />
      </section>

      <section id="experience" className="scroll-mt-24 py-16 md:py-20 lg:py-24">
        <Experience />
      </section>

      <section id="featured-blog" className="scroll-mt-24 py-16 md:py-20 lg:py-24 bg-muted/30">
        <FeaturedBlog />
      </section>

      <section id="about" className="scroll-mt-24 py-16 md:py-20 lg:py-24">
        <About />
      </section>

      <section id="contact" className="scroll-mt-24 py-16 md:py-20 lg:py-24 bg-muted/30">
        <Contact />
      </section>
    </main>
  )
}
