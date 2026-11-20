import { mockApi } from '@/mocks/mockApi';
import { TASK_FIELDS } from '@/services/fragments';
import { gql, graphql } from '@/services/graphql';
import { mocksEnabled } from '@/services/mode';
import type { CreateTaskRequest, Task, TaskQuery } from '@/types';

const TASKS = gql`
  query Tasks($filter: TaskFilterInput) {
    tasks {
      list(filter: $filter) {
        ...TaskFields
      }
    }
  }
  ${TASK_FIELDS}
`;

const MY_TASKS = gql`
  query MyTasks {
    tasks {
      mine {
        ...TaskFields
      }
    }
  }
  ${TASK_FIELDS}
`;

const TASK_BY_ID = gql`
  query TaskById($id: ID!) {
    tasks {
      byId(id: $id) {
        ...TaskFields
      }
    }
  }
  ${TASK_FIELDS}
`;

const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    tasks {
      create(input: $input) {
        ...TaskFields
      }
    }
  }
  ${TASK_FIELDS}
`;

export const taskService = {
  list: async (filter?: TaskQuery): Promise<Task[]> => {
    if (mocksEnabled) return mockApi.tasks.list(filter);
    return (await graphql<{ tasks: { list: Task[] } }>(TASKS, { filter })).tasks.list;
  },
  mine: async (): Promise<Task[]> => {
    if (mocksEnabled) return mockApi.tasks.mine();
    return (await graphql<{ tasks: { mine: Task[] } }>(MY_TASKS)).tasks.mine;
  },
  get: async (id: string): Promise<Task> => {
    if (mocksEnabled) return mockApi.tasks.get(id);
    return (await graphql<{ tasks: { byId: Task } }>(TASK_BY_ID, { id })).tasks.byId;
  },
  create: async (input: CreateTaskRequest): Promise<Task> => {
    if (mocksEnabled) return mockApi.tasks.create(input);
    return (await graphql<{ tasks: { create: Task } }>(CREATE_TASK, { input })).tasks.create;
  },
};
