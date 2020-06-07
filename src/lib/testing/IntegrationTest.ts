import {Test} from './tests';

export class IntegrationTest {
  tests: Test[] = [];
  title: string;

  constructor(title: string) {
    this.title = title;
  }

  protected registerTest(
    name: string,
    fn: (log: (str: string) => void) => Promise<any>,
  ) {
    this.tests.push({
      name,
      run: fn,
    });
  }
}
