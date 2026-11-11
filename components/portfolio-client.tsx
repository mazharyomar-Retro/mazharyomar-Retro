"use client"

import { useMemo, useState } from "react"
import type { Project, StackGroup } from "@/data/portfolio"

type Profile = {
  name: string
  shortName: string
  role: string
  location: string
  availability: string
  bio: string
  email: string
  github: string
  linkedin: string
  resumeLabel: string
}

const filters = ["All", "Freelance", "University Projects"] as const

type PortfolioClientProps = {
  profile: Profile
  projects: Project[]
  stack: StackGroup[]
}

export function PortfolioClient({ profile, projects, stack }: PortfolioClientProps) {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All")
  const categories = useMemo(() => new Set(projects.map((project) => project.category)), [projects])
  const visibleFilters = filters.filter((filter) => filter === "All" || categories.has(filter))
  const visibleProjects = activeFilter === "All"
    ? projects
    : projects.filter((project) => project.category === activeFilter)

  return (
    <main>
      <header className="site-header">
        <nav className="nav-shell" aria-label="Main navigation">
          <a className="wordmark" href="#top" aria-label={`${profile.shortName}, home`}>
            <span className="wordmark-mark">A<span>.</span></span>
            <span>{profile.shortName}</span>
          </a>
          <div className="nav-links">
            <a href="#projects">Projects</a>
            <a href="#stack">Stack</a>
            <a href="#contact">Contact</a>
          </div>
          <a className="availability" href={`mailto:${profile.email}`}>
            <span className="status-dot" />
            <span>{profile.availability}</span>
          </a>
        </nav>
      </header>

      <section className="hero section-shell" id="top" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" /> {profile.location}</p>
          <p className="hero-name">{profile.name}</p>
          <h1 id="hero-title">Building useful things<br /><span>for the real world.</span></h1>
          <p className="hero-role">{profile.role}</p>
          <p className="hero-bio">{profile.bio}</p>
          <div className="hero-actions">
            <a className="button button-primary" href={`mailto:${profile.email}`}>
              Let&apos;s talk <span aria-hidden="true">↗</span>
            </a>
            <a className="button button-secondary" href={profile.github} target="_blank" rel="noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
            <a className="button button-secondary" href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <div className="hero-aside" aria-label="Developer profile summary">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit-core"><span>MAYO</span><i /></div>
          <div className="aside-note"><span className="note-index">01 / 04</span><span>Ideas into<br />working software.</span></div>
          <div className="aside-location"><span className="mini-dot" /> Available worldwide</div>
        </div>
        <div className="hero-footnote"><span>Scroll to explore</span><span className="scroll-line" /></div>
      </section>

      <section className="projects-section section-shell" id="projects" aria-labelledby="projects-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><span className="eyebrow-line" /> Selected work</p>
            <h2 id="projects-title">Projects with<br /><span>purpose.</span></h2>
          </div>
          <p className="section-intro">A selection of products and systems I&apos;ve designed, built, and shipped — from marketplace infrastructure to community tools.</p>
        </div>
        <div className="filter-row" role="group" aria-label="Filter projects by category">
          {visibleFilters.map((filter) => (
            <button
              className={`filter-button${activeFilter === filter ? " is-active" : ""}`}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
            >
              {filter}<span className="filter-count">{filter === "All" ? projects.length : projects.filter((project) => project.category === filter).length}</span>
            </button>
          ))}
        </div>
        <div className="project-grid" aria-live="polite">
          {visibleProjects.map((project) => (
            <article className={`project-card${project.featured ? " project-featured" : ""}`} key={project.title}>
              <div className="project-visual">
                <div className="visual-topline"><span className="browser-dots"><i /><i /><i /></span><span className="visual-url">{project.domain}</span><span className="visual-arrow" aria-hidden="true">↗</span></div>
                <div className="visual-art" aria-hidden="true">
                  <span className="art-ring art-ring-back" />
                  <span className="art-ring art-ring-front" />
                  <span className="art-cross">+</span>
                  <span className="art-label">{project.number}</span>
                  <span className="art-word">{project.title === "Konnectli" ? "K" : project.title.split(" ").map((word) => word[0]).join("").slice(0, 2)}</span>
                </div>
                <span className="project-category">{project.category}</span>
              </div>
              <div className="project-body">
                <div className="project-title-row"><h3>{project.title}</h3><span className="project-number">{project.number}</span></div>
                <p>{project.description}</p>
                {project.role && <p className="project-role"><span>Role</span>{" "}{project.role}</p>}
                <ul className="tech-pills" aria-label={`${project.title} technologies`}>
                  {project.stack.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <div className="project-links">
                  <a className="project-link-live" href={project.url} target="_blank" rel="noreferrer">{project.featured ? "Live project" : "Source code"}<span aria-hidden="true">↗</span></a>
                  {project.sourceUrl && <a className="project-link-source" href={project.sourceUrl} target="_blank" rel="noreferrer">Source code</a>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="stack-section" id="stack" aria-labelledby="stack-title">
        <div className="section-shell stack-shell">
          <div className="stack-heading">
            <div><p className="eyebrow"><span className="eyebrow-line" /> Tools of the trade</p><h2 id="stack-title">A stack built<br />to <span>ship.</span></h2></div>
            <p>Practical tools for taking an idea from a well-structured database to a product people can use.</p>
          </div>
          <div className="stack-groups">
            {stack.map((group, index) => (
              <div className="stack-group" key={group.category}>
                <div className="stack-group-label"><span>0{index + 1}</span>{group.category}</div>
                <div className="stack-items">{group.items.map((item) => <span className="stack-item" key={item}>{item}<span aria-hidden="true">↗</span></span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section section-shell" id="contact" aria-labelledby="contact-title">
        <div className="contact-inner">
          <div className="contact-copy">
            <p className="eyebrow"><span className="eyebrow-line" /> What&apos;s next?</p>
            <h2 id="contact-title">Let&apos;s make<br /><span>something matter.</span></h2>
          </div>
          <div className="contact-action">
            <p>Have a product to build or a team that needs another thoughtful engineer? I&apos;d love to hear what you&apos;re working on.</p>
            <a className="contact-email" href={`mailto:${profile.email}`}>{profile.email}<span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>

      <footer className="site-footer section-shell">
        <a className="footer-brand" href="#top">{profile.shortName}<span>.</span></a>
        <p>© {new Date().getFullYear()} {profile.name}. Built with intention.</p>
        <div className="footer-links">
          <a href={profile.github} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
          <span className="vercel-badge"><span className="vercel-triangle" /> Deployed on Vercel</span>
        </div>
      </footer>
    </main>
  )
}
