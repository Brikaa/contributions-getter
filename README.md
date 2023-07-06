# contributions-getter

A JavaScript/TypeScript library that gets all of the GitHub repositories a user has contributed to since their account
creation

# Example usage

```typescript
import { getContributions } from "contributions-getter";

const contributions = await getContributions("github_token", "github_username");
console.log(JSON.stringify(contributions, null, 2));
```

# Configuration

A third parameter can be supplied, which is the Config object.
It can optionally contain:

- `monthsInterval`: the interval of getting the contributions in months (defaults to 12 months).

  > Note that the maximum repositories that can be shown in a certain time interval is 100 repositories, so if you have
  > contributed to more than that within a time period you may consider decreasing the time period

  > Note that decreasing the time period increases the number of requests that are sent to the GitHub API

- `fetchFn`: the function that is used for sending the requests (defaults to `fetch`). This is mainly used for testing.
  This function has the same signature as `fetch` except only `json`, `status` and `statusText` are required in the
  response.

# Example output

```
[
  {
    "startDate": "2022-07-06T08:34:06.813Z",
    "endDate": "2023-07-06T07:34:06.813Z",
    "repos": [
      {
        "commits": 168,
        "description": "Usage of principles learnt in the Software Design and Architecture course to create an abstract e-payment system",
        "name": "sda-assignment/sda-assignment",
        "primaryLanguage": "Java",
        "stars": 1,
        "url": "https://github.com/sda-assignment/sda-assignment",
        "commitsUrl": "https://github.com/sda-assignment/sda-assignment/commits?author=Brikaa&since=2022-07-06&until=2023-07-07",
        "isPrivate": false
      },
      ...
    ]
  },
  ...
]
```

# Used GraphQL query

```graphql
query getUser($login: String!, $from: DateTime, $to: DateTime) {
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
}
```

# Testing

Create a file called `token.txt` in the root of the directory containing your GitHub token
then run `npm test` or `npm run coverage`.
