import { getContributions } from '..';
import { GraphQLException, NotSuccessStatusException } from '../exceptions/exceptions';
import { readFileSync } from 'fs';
import { jsonStringify } from '../util';

let authToken: string;

beforeAll(() => {
  authToken = readFileSync('./token.txt').toString();
});

describe('getContributions', () => {
  it('throws NotSuccessStatusException when auth token is incorrect', async () => {
    await expect(() => getContributions('Bearer xxx', 'brikaa')).rejects.toThrow(
      NotSuccessStatusException
    );
  });

  it('returns the contributions when the auth token and data are correct', async () => {
    const contributions = await getContributions(authToken, 'brikaa');
    console.log(jsonStringify(contributions));
  });

  it('throws GraphQLException when the username is incorrect', async () => {
    // A GitHub username can never be 'new'
    await expect(() => getContributions(authToken, 'new')).rejects.toThrow(GraphQLException);
  });
});
