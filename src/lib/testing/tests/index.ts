import {MessagesIntegrationTest} from './message-tests';
import {UserInfoIntegrationTest} from './user-info-tests';

export type TestFn = (log: (str: string) => void) => Promise<void>;

export interface Test {
  name: string;
  run: TestFn;
}

export interface TestSection {
  title: string;
  data: Test[];
}

const tests = [new MessagesIntegrationTest(), new UserInfoIntegrationTest()];

export default tests;
