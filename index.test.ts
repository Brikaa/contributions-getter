import { getContributions } from '.';
import { NotSuccessStatusException } from './exceptions';
import { readFileSync } from 'fs';

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

  it('returns the contributions when the auth token is correct', async () => {
    const contributions = await getContributions(authToken, 'brikaa');
    console.log(contributions);
  });
});
