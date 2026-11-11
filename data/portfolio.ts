export type ProjectCategory = "Freelance" | "University Projects"

export type Project = {
  title: string
  category: ProjectCategory
  description: string
  stack: string[]
  role?: string
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
  shortName: "Mohamed Azhar Yusuf Omar",
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
    category: "Freelance",
    description:
      "A live, production marketplace connecting SME vendors with customers across South Africa. Includes vendor, customer, and admin portals, commission-based payments, KYB verification, location-aware search, and subscription tiers.",
    role: "Sole developer — architecture, backend, frontend, and deployment.",
    stack: ["PHP", "MySQL", "Vanilla JavaScript", "PayFast", "HostAfrica / cPanel"],
    url: "https://konnectli.com/",
    domain: "konnectli.com",
    featured: true,
  },
  {
    number: "02",
    title: "CMCS — Lecturer Claim Management System",
    category: "University Projects",
    description: "A lecturer claim management system for tracking and submitting payment claims.",
    role: "Developer (university project).",
    stack: ["C#", "SQL Server", "SSMS"],
    url: "https://github.com/VCSTDN2024/prog6212-poe-MAZHAR-02",
    domain: "github.com/VCSTDN2024",
  },
  {
    number: "03",
    title: "Agri-Energy Connect Platform",
    category: "University Projects",
    description:
      "A web platform for farmers to manage and publish agricultural products, with employee tools for farmer accounts and searchable, filterable listings. Secure role-based login supports both workflows.",
    role: "Developer (university project).",
    stack: ["ASP.NET Core MVC", "C#", "SQL Server"],
    url: "https://github.com/VCSTDN2024/prog7311-part-2-MAZHAR-02-1",
    domain: "github.com/VCSTDN2024",
  },
  {
    number: "04",
    title: "Municipal Community Platform MyMunicipal",
    category: "University Projects",
    description:
      "A community service platform for residents to report municipal issues and track requests, with local events and RSVP. Uses BSTs, heaps, and graphs for efficient data handling.",
    role: "Developer (university project).",
    stack: ["ASP.NET Core MVC / .NET 9", "C#", "SQL Server / ADO.NET", "Tailwind CSS"],
    url: "https://github.com/VCSTDN2024/prog7312-poe-MAZHAR-02",
    domain: "github.com/VCSTDN2024",
  },
  {
    number: "05",
    title: "Majoko Rentals — Website and App",
    category: "University Projects",
    description: "A rental-property website and companion app for discovering and managing rental properties.",
    role: "UI/UX designer and developer (university project).",
    stack: ["C#", "Firebase"],
    url: "https://github.com/VCSTDN2024/insy7315-poe-ctrl-alt-elite-2",
    domain: "github.com/VCSTDN2024",
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
 * CSV headers: title, category, description, role, stack, url, domain, sourceUrl, number.
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
            category: isProjectCategory(category) ? category : "University Projects",
            description: row.description?.trim() || "",
            role: row.role?.trim() || undefined,
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
          category: isProjectCategory(rawCategory) ? rawCategory : "University Projects",
          description: readText("description"),
          role: readText("role") || undefined,
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
  return ["Freelance", "University Projects"].includes(value)
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
