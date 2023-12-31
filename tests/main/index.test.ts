import { getContributions } from "../../main";
import {
  GraphQLException,
  InvalidConfigException,
  NotSuccessStatusException,
} from "../../exceptions/exceptions";
import { readFileSync } from "fs";
import { jsonStringify } from "../../main/util";
import { FetchType } from "../../types/configTypes";
import { expect, jest } from "@jest/globals";

let authToken: string;

beforeAll(() => {
  authToken = readFileSync("./token.txt").toString();
});

describe("getContributions", () => {
  it("throws NotSuccessStatusException when auth token is incorrect", async () => {
    await expect(() =>
      getContributions("Bearer xxx", "brikaa")
    ).rejects.toThrow(NotSuccessStatusException);
  });

  it("returns no undefined property values in each contribution object", async () => {
    const contributions = await getContributions(authToken, "brikaa");

    contributions.forEach((contribution) => {
      const contributionCopy: any = contribution;
      for (const key in contributionCopy)
        expect(contributionCopy[key]).toBeDefined();

      contribution.repos.forEach((r) => {
        const repoCopy: any = r;
        for (const key in repoCopy) expect(repoCopy[key]).toBeDefined();
      });
    });

    console.log(jsonStringify(contributions));
  });

  it("throws GraphQLException when the username is incorrect", async () => {
    // A GitHub username can never be 'new'
    await expect(() => getContributions(authToken, "new")).rejects.toThrow(
      GraphQLException
    );
  });

  const createMockFetch = (
    jsonResponse: any,
    status: number,
    statusText: string
  ): FetchType =>
    jest.fn<FetchType>().mockResolvedValue({
      json: async () => jsonResponse,
      status,
      statusText,
    });

  it("throws GraphQLException when there is no data", async () => {
    const fetchNoData = createMockFetch({}, 200, "OK");
    await expect(() =>
      getContributions(authToken, "brikaa", { fetchFn: fetchNoData })
    ).rejects.toThrow(GraphQLException);
  });

  it("throws GraphQLException when data field is null", async () => {
    const fetchNullData = createMockFetch({ data: null }, 200, "OK");
    await expect(() =>
      getContributions(authToken, "brikaa", { fetchFn: fetchNullData })
    ).rejects.toThrow(GraphQLException);
  });

  it("does not accept a monthsInterval that is more than 12", async () => {
    await expect(() =>
      getContributions(authToken, "brikaa", { monthsInterval: 13 })
    ).rejects.toThrow(InvalidConfigException);
  });

  it("does not accept a monthsInterval that is less than 1", async () => {
    await expect(() =>
      getContributions(authToken, "brikaa", { monthsInterval: 0 })
    ).rejects.toThrow(InvalidConfigException);
  });

  it("does not accept a decimal monthsInterval", async () => {
    await expect(() =>
      getContributions(authToken, "brikaa", { monthsInterval: 3.4 })
    ).rejects.toThrow(InvalidConfigException);
  });

  it("divides the periods according to monthsInterval correctly", async () => {
    const monthsInterval = 11;
    const contributions = await getContributions(authToken, "brikaa", {
      monthsInterval,
    });
    contributions.forEach((c) => {
      const expectedStartDate = c.endDate;
      expectedStartDate.setMonth(expectedStartDate.getMonth() - monthsInterval);
      expect(expectedStartDate).toStrictEqual(c.startDate);
    });
  });
});

describe.skip("getContributions intensive operations", () => {
  it("does not get rate-limited with around 60 requests", async () => {
    await getContributions(authToken, "brikaa", { monthsInterval: 1 });
  }, 20000);
});
