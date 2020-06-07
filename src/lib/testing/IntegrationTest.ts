import {Test} from './tests';

export class IntegrationTest {
  tests: Test[] = [];

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
