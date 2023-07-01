import { Contribution } from './contributionTypes';
import {
  UserWithContributionsResponseBody,
  UserWithCreationDateResponseBody
} from './responseTypes';

const USER_WITH_CREATION_DATE_QUERY = `query getUser($login: String!) {
  user(login: $login) {
    createdAt
  }
}`;

const USER_WITH_CONTRIBUTIONS_QUERY = `query getUser($login: String!, $from: DateTime) {
  user(login: $login) {
      contributionsCollection(from: $from) {
          commitContributionsByRepository {
              contributions {
                  totalCount
              }
              repository {
                  nameWithOwner
                  url
                  description
                  stargazerCount
                  primaryLanguage {
                      name
                  }
              }
          }
      }
  }
}`;

const sendRequest = async (token: string, query: string, variables: { [key: string]: any }) => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', `Bearer ${token}`);

  const data = { query, variables };
  const body = JSON.stringify(data);

  const options = {
    method: 'POST',
    headers,
    body
  };

  const res = await fetch('https://api.github.com/graphql', options);
  if (res.status >= 400) {
    throw new NotSuccessStatusException(
      `Request to GitHub API failed (${res.status} ${res.statusText})`
    );
  }
  const json = await res.json();
  return json;
};

/*
  - Get user with creation date
  - For each year, from the current year till the creation year, get the contributions
  - Massage the contribution into our contribution type
*/
export const getContributions = async (
  token: string,
  userName: string
): Promise<Contribution[]> => {
  const userWithDateRes: UserWithCreationDateResponseBody = await sendRequest(
    token,
    USER_WITH_CREATION_DATE_QUERY,
    { login: userName }
  );
  const creationYear = userWithDateRes.data.user.createdAt.getFullYear();
  const contributions: Contribution[] = [];
  for (let year = new Date().getFullYear(); year >= creationYear; --year) {
    const userWithContributionsRes: UserWithContributionsResponseBody = await sendRequest(
      token,
      USER_WITH_CONTRIBUTIONS_QUERY,
      { login: userName, from: year }
    );
    contributions.push({
      year,
      repos:
        userWithContributionsRes.data.user.contributionsCollection.commitContributionsByRepository.map(
          (c) => ({
            commits: c.contributions.totalCount,
            description: c.repository.description,
            name: c.repository.nameWithOwner,
            primaryLanguage:
              c.repository.primaryLanguage === null ? null : c.repository.primaryLanguage?.name,
            stars: c.repository.stargazerCount,
            url: c.repository.url,
            commitsUrl: c.url
          })
        )
    });
  }
  return contributions;
};
