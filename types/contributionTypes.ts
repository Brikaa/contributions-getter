export interface Repository {
  name: string;
  url: string;
  commitsUrl: string;
  description: string | null;
  stars: number;
  primaryLanguage: string | null;
  commits: number;
  isPrivate: boolean;
}

export interface ContributionsInterval {
  startDate: Date;
  endDate: Date;
  repos: Repository[];
}
