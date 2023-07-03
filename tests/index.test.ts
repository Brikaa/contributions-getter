import { getContributions } from '..';
import {
  GraphQLException,
  InvalidConfigException,
  NotSuccessStatusException
} from '../exceptions/exceptions';
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

  it('does not accept a monthsInterval that is more than 12', async () => {
    await expect(() => getContributions(authToken, 'brikaa', { monthsInterval: 13 })).rejects.toThrow(
      InvalidConfigException
    );
  });

  it('does not accept a monthsInterval that is less than 1', async () => {
    await expect(() => getContributions(authToken, 'brikaa', { monthsInterval: 0 })).rejects.toThrow(
      InvalidConfigException
    );
  });

  it('does not accept a decimal monthsInterval', async () => {
    await expect(() => getContributions(authToken, 'brikaa', { monthsInterval: 3.4 })).rejects.toThrow(
      InvalidConfigException
    );
  });
});
