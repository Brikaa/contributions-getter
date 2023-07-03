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

  it('returns no undefined property values in each contribution object', async () => {
    const contributions = await getContributions(authToken, 'brikaa');

    contributions.forEach((contribution) => {
      const contributionClone: any = { ...contribution };
      for (const key in contributionClone) expect(contributionClone[key]).toBeDefined();

      contribution.repos.forEach((r) => {
        const repoClone: any = { ...r };
        for (const key in repoClone) expect(repoClone[key]).toBeDefined();
      });
    });

    console.log(jsonStringify(contributions));
  });

  it('throws GraphQLException when the username is incorrect', async () => {
    // A GitHub username can never be 'new'
    await expect(() => getContributions(authToken, 'new')).rejects.toThrow(GraphQLException);
  });

  it('does not accept a monthsInterval that is more than 12', async () => {
    await expect(() =>
      getContributions(authToken, 'brikaa', { monthsInterval: 13 })
    ).rejects.toThrow(InvalidConfigException);
  });

  it('does not accept a monthsInterval that is less than 1', async () => {
    await expect(() =>
      getContributions(authToken, 'brikaa', { monthsInterval: 0 })
    ).rejects.toThrow(InvalidConfigException);
  });

  it('does not accept a decimal monthsInterval', async () => {
    await expect(() =>
      getContributions(authToken, 'brikaa', { monthsInterval: 3.4 })
    ).rejects.toThrow(InvalidConfigException);
  });

  it('divides the periods according to monthsInterval correctly', async () => {
    const monthsInterval = 11;
    const contributions = await getContributions(authToken, 'brikaa', { monthsInterval });
    contributions.forEach((c) => {
      const expectedStartDate = c.endDate;
      expectedStartDate.setMonth(expectedStartDate.getMonth() - monthsInterval);
      expect(expectedStartDate).toStrictEqual(c.startDate);
    });
  });
});

describe.skip('getContributions intensive operations', () => {
  it('does not get rate-limited with around 60 requests', async () => {
    await getContributions(authToken, 'brikaa', { monthsInterval: 1 });
  }, 20000);
});
