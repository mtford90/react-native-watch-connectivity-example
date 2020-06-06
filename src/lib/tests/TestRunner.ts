import {action, observable, runInAction} from 'mobx';
import tests, {Test} from './tests';
import {keys} from 'lodash';

import {flatten, keyBy} from 'lodash';

const allTests: {[name: string]: Test} = keyBy(
  flatten(tests.map((t) => t.data)),
  (t) => t.name,
);

type TestStatus =
  | {status: 'pending'}
  | {status: 'running'}
  | {status: 'failed'; error: Error}
  | {status: 'passed'};

export default class TestRunner {
  private tests = keyBy(flatten(tests.map((t) => t.data)), (t) => t.name);

  @observable.shallow
  public testStatus: {[name: string]: TestStatus} = Object.fromEntries(
    keys(allTests).map((name): [string, TestStatus] => [
      name,
      {status: 'pending'},
    ]),
  );

  @observable
  logs: {[name: string]: string[]} = {};

  @action
  runTest(name: string) {
    const test = this.tests[name];

    if (!test) {
      throw new Error(`Test ${name} does not exist`);
    }

    const status = this.testStatus[name] || 'pending';

    if (status.status === 'running') {
      return;
    }

    this.logs[name] = [];

    this.testStatus[name] = {status: 'running'};

    let isTimedOut = false;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const logger = (str: string) => {
      runInAction(() => {
        this.logs[name].push(str);
      });
    };

    test
      .run(logger)
      .then(() => {
        if (!isTimedOut) {
          runInAction(() => {
            this.testStatus[name] = {status: 'passed'};
          });
        }

        if (timeout) {
          clearTimeout(timeout);
        }
      })
      .catch((err: Error) => {
        if (!isTimedOut) {
          console.error('error', err);
          runInAction(() => {
            this.testStatus[name] = {status: 'failed', error: err};
          });
        }

        if (timeout) {
          clearTimeout(timeout);
        }
      });

    timeout = setTimeout(() => {
      isTimedOut = true;
      runInAction(() => {
        this.testStatus[name] = {
          status: 'failed',
          error: new Error('Timed out'),
        };
      });
    }, 5000);
  }
}
