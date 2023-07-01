interface Repository {
  nameWithOwner: string;
  url: string;
  description: string | null;
  stargazerCount: number;
  primaryLanguage: {
    name: string;
  } | null;
}

interface CommitContributionsByRepository {
  contributions: {
    totalCount: number;
  };
  repository: Repository;
  url: string;
}

interface UserWithContributions {
  contributionsCollection: {
    commitContributionsByRepository: CommitContributionsByRepository[];
  };
}

interface UserWithCreationDate {
  createdAt: Date;
}

interface ResponseBody<T extends UserWithContributions | UserWithCreationDate> {
  data: {
    user: T;
  };
}

export type UserWithContributionsResponseBody = ResponseBody<UserWithContributions>;
export type UserWithCreationDateResponseBody = ResponseBody<UserWithCreationDate>;
