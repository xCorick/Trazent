import { mockApi } from '@/mocks/mockApi';
import { SITE_FIELDS, USER_FIELDS } from '@/services/fragments';
import { gql, graphql } from '@/services/graphql';
import { mocksEnabled } from '@/services/mode';
import type { Site, User } from '@/types';

const ACTIVE_SITES = gql`
  query ActiveSites {
    sites {
      active {
        ...SiteFields
      }
    }
  }
  ${SITE_FIELDS}
`;

const ACTIVE_CONTRACTORS = gql`
  query ActiveContractors {
    users {
      activeContractors {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

/** Catálogos que usan varias pantallas: sitios activos y contratistas activos. */
export const catalogService = {
  sites: async (): Promise<Site[]> => {
    if (mocksEnabled) return mockApi.catalogs.sites();
    return (await graphql<{ sites: { active: Site[] } }>(ACTIVE_SITES)).sites.active;
  },
  contractors: async (): Promise<User[]> => {
    if (mocksEnabled) return mockApi.catalogs.contractors();
    return (await graphql<{ users: { activeContractors: User[] } }>(ACTIVE_CONTRACTORS)).users.activeContractors;
  },
};
