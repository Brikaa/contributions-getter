interface Repository {
  name: string;
  url: string;
  commitsUrl: string;
  description: string | null;
  stars: number;
  primaryLanguage: string | null;
  commits: number;
  isPrivate: boolean;
}

export interface Contribution {
  year: number;
  repos: Repository[];
}
