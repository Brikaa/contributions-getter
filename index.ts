import { Contribution } from './types/contributionTypes';
import { GraphQLException, NotSuccessStatusException } from './exceptions/exceptions';
import {
  UserResponseBody,
  UserWithContributionsResponseBody,
  UserWithCreationDateResponseBody
} from './types/responseTypes';
import { jsonStringify } from './util';
import { Config } from './types/configTypes';

const USER_WITH_CREATION_DATE_QUERY = `query getUser($login: String!) {
  user(login: $login) {
    createdAt
  }
}`;

const USER_WITH_CONTRIBUTIONS_QUERY = `query getUser($login: String!, $from: DateTime, $to: DateTime) {
  user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
          commitContributionsByRepository(maxRepositories: 100) {
              url
              contributions {
                  totalCount
              }
              repository {
                  isPrivate
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

const sendRequest = async (
  token: string,
  handleErrors: (response: any) => void,
  query: string,
  variables: { [key: string]: any }
) => {
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
  handleErrors(json);
  return json;
};

const handleResponseError = (response: UserResponseBody) => {
  let message;
  if (response.data === undefined) message = 'Missing data field';
  else if (response.data === null) message = 'Data field is null';
  else if (response.data.user === null) message = 'User field is null';
  else return;
  const graphQLError = !!response.errors
    ? jsonStringify(response.errors)
    : 'No information about the error in the GraphQL response';
  throw new GraphQLException(`${message}\nGraphQL response error: ${graphQLError}`);
};

/**
 * - Get user with creation date
 * - For each year, from the current year till the creation year, get the contributions
 * - Massage the contribution into Contribution[]
 */
export const getContributions = async (
  token: string,
  userName: string,
  config: Config = { monthsInterval: 12 }
): Promise<Contribution[]> => {
  const userWithDateRes: UserWithCreationDateResponseBody = await sendRequest(
    token,
    handleResponseError,
    USER_WITH_CREATION_DATE_QUERY,
    { login: userName }
  );
  const creationDate = new Date(userWithDateRes.data!.user!.createdAt);
  const contributions: Contribution[] = [];
  let endDate = new Date();
  let startDate = new Date(endDate);
  while (endDate >= creationDate) {
    startDate.setMonth(startDate.getMonth() - config.monthsInterval);
    const userWithContributionsRes: UserWithContributionsResponseBody = await sendRequest(
      token,
      handleResponseError,
      USER_WITH_CONTRIBUTIONS_QUERY,
      { login: userName, from: startDate, to: endDate }
    );
    contributions.push({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      repos:
        userWithContributionsRes.data!.user!.contributionsCollection.commitContributionsByRepository.map(
          (c) => ({
            commits: c.contributions.totalCount,
            description: c.repository.description,
            name: c.repository.nameWithOwner,
            primaryLanguage:
              c.repository.primaryLanguage === null ? null : c.repository.primaryLanguage?.name,
            stars: c.repository.stargazerCount,
            url: c.repository.url,
            commitsUrl: c.url,
            isPrivate: c.repository.isPrivate
          })
        )
    });
    endDate = new Date(startDate);
  }
  return contributions;
};
