import { mockApi } from '@/mocks/mockApi';
import { USER_FIELDS } from '@/services/fragments';
import { gql, graphql } from '@/services/graphql';
import { mocksEnabled } from '@/services/mode';
import type { LoginRequest, LoginResponse, User } from '@/types';

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    auth {
      login(input: $input) {
        accessToken
        refreshToken
        user {
          ...UserFields
        }
      }
    }
  }
  ${USER_FIELDS}
`;

const LOGOUT = gql`
  mutation Logout {
    auth {
      logout
    }
  }
`;

export const authService = {
  login: async (input: LoginRequest): Promise<LoginResponse> => {
    if (mocksEnabled) return mockApi.auth.login(input);
    return (await graphql<{ auth: { login: LoginResponse } }>(LOGIN, { input })).auth.login;
  },
  logout: async (): Promise<void> => {
    if (mocksEnabled) return mockApi.auth.logout();
    await graphql(LOGOUT);
  },
  restoreSession: (user: User) => {
    if (mocksEnabled) mockApi.auth.restore(user.id);
  },
};
