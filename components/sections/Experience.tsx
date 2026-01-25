'use client'

import { copy } from '@/config/copy'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Reveal, StaggerContainer } from '@/components/motion/Motion'

const renderTechBadge = (tech) => (
  <Badge key={tech} variant="outline" className="text-xs">
    {tech}
  </Badge>
)

const renderAchievement = (achievement, index) => (
  <li key={index} className="text-sm text-muted-foreground">
    • {achievement}
  </li>
)

const renderExperienceItem = (item, index) => (
  <Reveal key={index}>
    <div className="relative pl-8 md:pl-0">
      {/* Timeline Line (Desktop only) */}
      <div className="hidden md:block absolute left-[50%] top-0 bottom-0 w-px bg-border -translate-x-1/2" />
      
      {/* Timeline Dot (Desktop only) */}
      <div className="hidden md:block absolute left-[50%] top-6 w-4 h-4 rounded-full bg-primary border-4 border-background -translate-x-1/2 z-10" />

      <div className={`md:flex items-start gap-12 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
        
        {/* Date (Desktop) */}
        <div className={`hidden md:block flex-1 py-4 ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
          <span className="text-sm font-bold text-primary tracking-wider uppercase">
            {item.period}
          </span>
        </div>

        {/* Card Content */}
        <div className="flex-1">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start md:block">
                <div>
                  <CardTitle className="text-lg md:text-xl">{item.role}</CardTitle>
                  <CardDescription className="text-base font-medium mt-1">
                    {item.company}
                  </CardDescription>
                </div>
                {/* Date (Mobile) */}
                <span className="md:hidden text-xs font-bold text-primary tracking-wider uppercase bg-primary/10 px-2 py-1 rounded">
                  {item.period}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">
                {item.description}
              </p>
              
              {item.achievements && (
                <ul className="space-y-2">
                  {item.achievements.map(renderAchievement)}
                </ul>
              )}

              {item.technologies && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {item.technologies.map(renderTechBadge)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </Reveal>
)

export const Experience = () => {
  if (!copy.experience) return null

  return (
    <div className="container">
      <Reveal>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {copy.experience.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {copy.experience.subtitle}
          </p>
        </div>
      </Reveal>

      <StaggerContainer className="space-y-8 md:space-y-0 relative">
        {copy.experience.items.map(renderExperienceItem)}
      </StaggerContainer>
    </div>
  )
}
