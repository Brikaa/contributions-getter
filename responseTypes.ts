interface Repository {
  nameWithOwner: string;
  url: string;
  description: string | null;
  stargazerCount: number;
  primaryLanguage: {
    name: string;
  } | null;
  isPrivate: boolean;
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
  createdAt: string;
}

interface ResponseBody<T extends UserWithContributions | UserWithCreationDate> {
  data?: {
    user: T | null;
  } | null;
  errors?: any;
}

export type UserWithContributionsResponseBody = ResponseBody<UserWithContributions>;
export type UserWithCreationDateResponseBody = ResponseBody<UserWithCreationDate>;
export type UserResponseBody = UserWithContributionsResponseBody | UserWithCreationDateResponseBody;
