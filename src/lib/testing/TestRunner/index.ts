import {action, computed, observable, runInAction} from 'mobx';
import {Test, TestSection} from '../tests';
import {flatten, keys, some, keyBy} from 'lodash';
import {IntegrationTest} from '../IntegrationTest';

type TestStatus =
  | {status: 'pending'}
  | {status: 'running'}
  | {status: 'failed'; error: Error}
  | {status: 'passed'};

export default class TestRunner {
  tests: TestSection[] = [];

  testsByName: {[name: string]: Test} = {};

  @observable.shallow
  public testStatus: {[name: string]: TestStatus} = {};

  @observable
  logs: {[name: string]: [number, string][]} = {};

  constructor(tests: IntegrationTest[]) {
    this.tests = tests.map((t) => ({title: t.title, data: t.tests}));
    this.testsByName = keyBy(flatten(this.tests.map((t) => t.data)), 'name');
    this.testStatus = Object.fromEntries(
      keys(this.testsByName).map((name): [string, TestStatus] => [
        name,
        {status: 'pending'},
      ]),
    );
  }

  @computed
  get running() {
    return some(Object.values(this.testStatus), (s) => s.status === 'running');
  }

  @action
  runTests(names: string[]) {
    if (this.running) {
      return;
    }

    names.forEach((name) => {
      this.logs[name] = [];
      this.testStatus[name] = {status: 'running'};
    });

    Promise.mapSeries(names, (name) => this._runTest(name)).then(
      () => {
        return null;
      },
      (err) => {
        console.error(err);
      },
    );
  }

  @action
  runTest(name: string) {
    const test = this.testsByName[name];

    if (!test) {
      throw new Error(`Test ${name} does not exist`);
    }

    if (this.running) {
      return;
    }

    this.logs[name] = [];

    this.testStatus[name] = {status: 'running'};
    this._runTest(name);
  }

  @action
  private log(name: string, text: string) {
    console.log(`[${name}]`, text);
    this.logs[name].push([Date.now(), text]);
  }

  private _runTest(name: string) {
    console.log(`[${name}] running test`);
    const test = this.testsByName[name];

    if (!test) {
      throw new Error(`Test ${name} does not exist`);
    }

    let isTimedOut = false;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const promise = test
      .run((text) => {
        this.log(name, text);
      })
      .then(() => {
        if (!isTimedOut) {
          console.log(`[${name}] passed`);
          runInAction(() => {
            this.testStatus[name] = {status: 'passed'};
          });
        }

        if (timeout) {
          clearTimeout(timeout);
        }

        return null;
      })
      .catch((err: Error) => {
        if (!isTimedOut) {
          console.error(`[${name}] error`, err);
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
        console.warn(`[${name}] timed out`);
        this.testStatus[name] = {
          status: 'failed',
          error: new Error('Timed out'),
        };
      });
    }, 10000);

    return promise;
  }
}