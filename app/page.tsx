import { PortfolioClient } from "@/components/portfolio-client"
import { getPortfolioProjects, profile, stack } from "@/data/portfolio"

export default async function Home() {
  const projectList = await getPortfolioProjects()

  return <PortfolioClient profile={profile} projects={projectList} stack={stack} />
}
