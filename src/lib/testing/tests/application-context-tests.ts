import {IntegrationTest} from '../IntegrationTest';

import {isEqual} from 'lodash';
import {assert, TestLogFn} from './util';
import {sendWatchMessage, subscribeToMessages} from '../../watch/messages';
import {
  getApplicationContext,
  subscribeToApplicationContext,
  updateApplicationContext,
} from '../../watch/application-context';
import * as faker from 'faker';

export class ApplicationContextTests extends IntegrationTest {
  constructor() {
    super('Application Context');
    this.registerTest('Send application context', this.testApplicationContext);
    this.registerTest(
      'Subscribe to application context',
      this.testSubscribeToApplicationContext,
    );
  }

  testApplicationContext = async (log: TestLogFn) => {
    const sentApplicationContext = {x: faker.lorem.words(3)};
    await this.sendApplicationContextAndWaitForAck(sentApplicationContext, log);
    const applicationContext = await getApplicationContext();
    log('got application context: ' + JSON.stringify(applicationContext));

    assert(
      isEqual(applicationContext, sentApplicationContext),
      'application context must match',
    );
  };

  testSubscribeToApplicationContext = async (log: TestLogFn) => {
    return new Promise((resolve, reject) => {
      const expectedApplicationContext = {
        a: faker.lorem.words(2),
      };

      const unsubscribe = subscribeToApplicationContext(
        (applicationContextFromEvent) => {
          log(
            'received application context from watch event: ' +
              JSON.stringify(applicationContextFromEvent),
          );
          unsubscribe();
          assert(
            isEqual(applicationContextFromEvent, expectedApplicationContext),
          );
          getApplicationContext()
            .then((applicationContextFromGetter) => {
              log(
                'received application context from getApplicationContext: ' +
                  JSON.stringify(applicationContextFromGetter),
              );
              assert(
                isEqual(
                  applicationContextFromGetter,
                  expectedApplicationContext,
                ),
              );
              resolve();
            })
            .catch(reject);
          resolve();
        },
      );

      sendWatchMessage({
        test: true,
        text: 'send me some application context',
        context: expectedApplicationContext,
      });
      log('requested application context from watch');
    });
  };

  private sendApplicationContextAndWaitForAck = (
    applicationContextToSend: Record<string, unknown>,
    log: TestLogFn,
  ) => {
    return new Promise((resolve, reject) => {
      const unsubscribe = subscribeToMessages((err, payload) => {
        if (payload) {
          log('Received message: ' + JSON.stringify(payload));
        }
        if (err) {
          reject(err);
          unsubscribe();
        } else if (
          payload?.text === 'application context received by the watch'
        ) {
          unsubscribe();
          const applicationContext = payload && payload['application-context'];
          if (typeof applicationContext === 'object') {
            resolve(applicationContext);
          } else {
            reject(new Error('Invalid payload'));
          }
        }
      });

      updateApplicationContext(applicationContextToSend);

      log(
        'sent application context: ' + JSON.stringify(applicationContextToSend),
      );
      log('waiting for acknowledgement from watch');
    });
  };
}
