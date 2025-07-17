export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  images: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  completedAt: string;
  client?: {
    name: string;
    industry: string;
  };
}

export const portfolio: any[] = [];