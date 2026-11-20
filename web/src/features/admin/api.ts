import { mockApi } from '@/mocks/mockApi';
import { SITE_FIELDS, USER_FIELDS } from '@/services/fragments';
import { gql, graphql } from '@/services/graphql';
import { mocksEnabled } from '@/services/mode';
import type {
  CreateUserRequest,
  CreateUserResponse,
  SaveSiteRequest,
  Site,
  UpdateSiteRequest,
  UpdateUserRequest,
  User,
} from '@/types';

const USERS = gql`
  query Users {
    users {
      list {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    users {
      create(input: $input) {
        temporaryPassword
        user {
          ...UserFields
        }
      }
    }
  }
  ${USER_FIELDS}
`;

const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    users {
      update(input: $input) {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

const ALL_SITES = gql`
  query AllSites {
    sites {
      list {
        ...SiteFields
      }
    }
  }
  ${SITE_FIELDS}
`;

const CREATE_SITE = gql`
  mutation CreateSite($input: CreateSiteInput!) {
    sites {
      create(input: $input) {
        ...SiteFields
      }
    }
  }
  ${SITE_FIELDS}
`;

const UPDATE_SITE = gql`
  mutation UpdateSite($input: UpdateSiteInput!) {
    sites {
      update(input: $input) {
        ...SiteFields
      }
    }
  }
  ${SITE_FIELDS}
`;

/** Solo administrador. */
export const userService = {
  list: async (): Promise<User[]> => {
    if (mocksEnabled) return mockApi.users.list();
    return (await graphql<{ users: { list: User[] } }>(USERS)).users.list;
  },
  create: async (input: CreateUserRequest): Promise<CreateUserResponse> => {
    if (mocksEnabled) return mockApi.users.create(input);
    return (await graphql<{ users: { create: CreateUserResponse } }>(CREATE_USER, { input })).users.create;
  },
  update: async (input: UpdateUserRequest): Promise<User> => {
    if (mocksEnabled) return mockApi.users.update(input);
    return (await graphql<{ users: { update: User } }>(UPDATE_USER, { input })).users.update;
  },
};

/** Solo administrador: incluye sitios inactivos. */
export const siteService = {
  list: async (): Promise<Site[]> => {
    if (mocksEnabled) return mockApi.sites.list();
    return (await graphql<{ sites: { list: Site[] } }>(ALL_SITES)).sites.list;
  },
  create: async (input: SaveSiteRequest): Promise<Site> => {
    if (mocksEnabled) return mockApi.sites.create(input);
    return (await graphql<{ sites: { create: Site } }>(CREATE_SITE, { input })).sites.create;
  },
  update: async (input: UpdateSiteRequest): Promise<Site> => {
    if (mocksEnabled) return mockApi.sites.update(input);
    return (await graphql<{ sites: { update: Site } }>(UPDATE_SITE, { input })).sites.update;
  },
};
