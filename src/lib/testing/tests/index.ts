import {MessagesIntegrationTest} from './message-tests';

export type TestFn = (log: (str: string) => void) => Promise<void>;

export interface Test {
  name: string;
  run: TestFn;
}

export interface TestSection {
  title: string;
  data: Test[];
}

export default function getTests(): TestSection[] {
  return [{title: 'Messages', data: new MessagesIntegrationTest().tests}];
}
