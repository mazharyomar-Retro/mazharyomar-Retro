export type ProjectCategory = "Full-Stack" | "AI & Tools" | "Frontend"

export type Project = {
  title: string
  category: ProjectCategory
  description: string
  stack: string[]
  url: string
  domain: string
  sourceUrl?: string
  featured?: boolean
  number: string
}

export type StackGroup = {
  category: string
  items: string[]
}

// Edit these objects to update your portfolio without changing the UI.
export const profile = {
  name: "Mohamed Azhar Yusuf Omar",
  shortName: "Azhar Omar",
  role: "Full-Stack Developer & Builder",
  location: "Johannesburg, South Africa",
  availability: "Available for projects",
  bio: "I build thoughtful, database-driven products from the first data model to the final deployment. I’m an application development graduate and the solo builder behind a live multi-vendor marketplace.",
  email: "mazharyomar@gmail.com",
  github: "https://github.com/mazharyomar-Retro",
  linkedin: "https://www.linkedin.com/in/mohamed-azhar-yusuf-omar-76627a293/",
  resumeLabel: "BSc Application Development · 2026",
}

export const projects: Project[] = [
  {
    number: "01",
    title: "Konnectli",
    category: "Full-Stack",
    description:
      "A production multi-vendor marketplace connecting South African SMEs with customers. Built end-to-end with vendor, customer, and admin portals, KYB verification, and commission-based payments.",
    stack: ["PHP", "MySQL", "JavaScript", "PayFast"],
    url: "https://konnectli.com",
    domain: "konnectli.com",
    featured: true,
  },
  {
    number: "02",
    title: "Municipal Community Platform",
    category: "Full-Stack",
    description:
      "A resident-first service platform for reporting local issues and following their progress. Community events and RSVP sit alongside custom data structures for prioritization and location relationships.",
    stack: ["ASP.NET Core", "C#", "SQL Server", "Tailwind CSS"],
    url: "https://github.com/mazharyomar-Retro",
    domain: "Case study · GitHub",
  },
  {
    number: "03",
    title: "Agri-Energy Connect",
    category: "Full-Stack",
    description:
      "An agriculture platform that helps farmers publish product listings while staff manage accounts and browse the catalog. Role-based access keeps each workflow focused and secure.",
    stack: ["ASP.NET Core MVC", "C#", "SQL Server"],
    url: "https://github.com/mazharyomar-Retro",
    domain: "Case study · GitHub",
  },
  {
    number: "04",
    title: "CMCS Claims",
    category: "Full-Stack",
    description:
      "A lecturer claim management system that brings submission, validation, and approval into one clear workflow. Structured records make claim status and payment tracking straightforward.",
    stack: ["C#", "SQL Server", "Application Development"],
    url: "https://github.com/mazharyomar-Retro",
    domain: "Case study · GitHub",
  },
]

export const stack: StackGroup[] = [
  { category: "Frontend", items: ["JavaScript", "React", "HTML & CSS", "Tailwind CSS"] },
  { category: "Backend & data", items: ["PHP", "C# / .NET", "Node.js", "MySQL", "SQL Server"] },
  { category: "Tools & delivery", items: ["Git & GitHub", "Firebase", "PayFast", "HostAfrica"] },
]

/**
 * Optional server-side content source. Set PORTFOLIO_CSV_URL to a published
 * Google Sheets CSV URL, or PORTFOLIO_NOTION_DATABASE_ID plus NOTION_API_KEY
 * to read a Notion database (share the database with your integration first).
 * CSV headers: title, category, description, stack, url, domain, sourceUrl, number.
 * Notion properties use matching names; stack should be a multi-select property.
 * If variables are absent, a request fails, or parsing yields no projects, local
 * data remains the reliable fallback. Never expose the Notion key to the browser.
 */
export async function getPortfolioProjects(): Promise<Project[]> {
  const csvUrl = process.env.PORTFOLIO_CSV_URL
  const notionDatabaseId = process.env.PORTFOLIO_NOTION_DATABASE_ID
  const notionApiKey = process.env.NOTION_API_KEY

  try {
    if (csvUrl) {
      const response = await fetch(csvUrl, { next: { revalidate: 300 } })
      if (!response.ok) throw new Error("Portfolio CSV request failed")
      const text = await response.text()
      const [headerLine, ...lines] = text.trim().split(/\r?\n/)
      const headers = parseCsvRow(headerLine).map((value) => value.trim().toLowerCase())
      const rows = lines.map(parseCsvRow)
      const externalProjects = rows
        .map((cells, index): Project | null => {
          const row = Object.fromEntries(headers.map((key, cellIndex) => [key, cells[cellIndex] ?? ""]))
          const title = row.title?.trim()
          if (!title) return null
          const category = row.category?.trim() as ProjectCategory
          return {
            number: row.number?.trim() || String(index + 1).padStart(2, "0"),
            title,
            category: isProjectCategory(category) ? category : "Full-Stack",
            description: row.description?.trim() || "",
            stack: row.stack?.split(/[|,]/).map((item: string) => item.trim()).filter(Boolean) ?? [],
            url: safeUrl(row.url) || "#projects",
            domain: row.domain?.trim() || domainFromUrl(row.url),
            sourceUrl: safeUrl(row.sourceurl) || undefined,
          } satisfies Project
        })
        .filter((project): project is Project => project !== null)
      if (externalProjects.length) return externalProjects
    } else if (notionDatabaseId && notionApiKey) {
      const response = await fetch(`https://api.notion.com/v1/databases/${notionDatabaseId}/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${notionApiKey}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page_size: 100 }),
        next: { revalidate: 300 },
      })
      if (!response.ok) throw new Error("Notion portfolio request failed")
      const payload = (await response.json()) as { results?: Array<{ properties?: Record<string, any> }> }
      const externalProjects = (payload.results ?? []).flatMap((page, index) => {
        const properties = page.properties ?? {}
        const readText = (name: string) => {
          const property = properties[name]
          return property?.title?.map((part: { plain_text: string }) => part.plain_text).join("")
            ?? property?.rich_text?.map((part: { plain_text: string }) => part.plain_text).join("")
            ?? property?.url
            ?? ""
        }
        const title = readText("title")
        if (!title) return []
        const rawCategory = readText("category") as ProjectCategory
        const stackItems = properties.stack?.multi_select?.map((item: { name: string }) => item.name) ?? []
        const url = safeUrl(readText("url")) || "#projects"
        return [{
          number: readText("number") || String(index + 1).padStart(2, "0"),
          title,
          category: isProjectCategory(rawCategory) ? rawCategory : "Full-Stack",
          description: readText("description"),
          stack: stackItems,
          url,
          domain: readText("domain") || domainFromUrl(url),
          sourceUrl: safeUrl(readText("sourceUrl")) || undefined,
        } satisfies Project]
      })
      if (externalProjects.length) return externalProjects
    }
  } catch (error) {
    console.error("Unable to load external portfolio content; using local data.", error)
  }

  return projects
}

function parseCsvRow(line: string): string[] {
  const cells: string[] = []
  let cell = ""
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    if (character === '"' && line[index + 1] === '"' && quoted) {
      cell += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === "," && !quoted) {
      cells.push(cell)
      cell = ""
    } else {
      cell += character
    }
  }
  cells.push(cell)
  return cells
}

function isProjectCategory(value: string): value is ProjectCategory {
  return ["Full-Stack", "AI & Tools", "Frontend"].includes(value)
}

function safeUrl(value?: string): string | undefined {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined
  } catch {
    return undefined
  }
}

function domainFromUrl(value?: string): string {
  if (!value) return "Case study"
  try {
    return new URL(value).hostname.replace(/^www\./, "")
  } catch {
    return "Case study"
  }
}
