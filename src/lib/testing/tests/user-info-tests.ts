import {IntegrationTest} from '../IntegrationTest';
import {
  getUserInfo,
  sendUserInfo,
  subscribeToUserInfo,
} from '../../watch/user-info';

import {isEqual} from 'lodash';
import {assert, TestLogFn} from './util';
import {sendWatchMessage, subscribeToMessages} from '../../watch/messages';

export class UserInfoIntegrationTest extends IntegrationTest {
  constructor() {
    super('User Info');
    this.registerTest('Send user info', this.testUserInfo);
    this.registerTest('Subscribe to user info', this.testSubscribeToUserInfo);
  }

  testUserInfo = async (log: TestLogFn) => {
    const sentUserInfo = {uid: 'xyz', name: 'bob', email: 'bob@example.com'};
    await this.sendUserInfoAndWaitForAck(sentUserInfo, log);
    const userInfo = await getUserInfo();
    log('got user info: ' + JSON.stringify(userInfo));

    assert(isEqual(userInfo, sentUserInfo), 'user info must match');
  };

  testSubscribeToUserInfo = async (log: TestLogFn) => {
    // TODO: Test receipt of user info from the watch this time
    return new Promise((resolve, reject) => {
      const expectedUserInfo = {
        uid: 'xyz',
        name: 'bob',
        email: 'bob@example.com',
      };

      const unsubscribe = subscribeToUserInfo((userInfoFromEvent) => {
        log(
          'received user info from watch event: ' +
            JSON.stringify(userInfoFromEvent),
        );
        unsubscribe();
        assert(isEqual(userInfoFromEvent, expectedUserInfo));
        getUserInfo()
          .then((userInfoFromGetter) => {
            log(
              'received user info from getUserInfo: ' +
                JSON.stringify(userInfoFromGetter),
            );
            assert(isEqual(userInfoFromGetter, expectedUserInfo));
            resolve();
          })
          .catch(reject);
        resolve();
      });

      sendWatchMessage({test: true, text: 'send me some user info'});
      log('requested user info from watch');
    });
  };

  private sendUserInfoAndWaitForAck = (
    userInfoToSend: Record<string, unknown>,
    log: TestLogFn,
  ) => {
    return new Promise((resolve, reject) => {
      sendUserInfo(userInfoToSend);

      const unsubscribe = subscribeToMessages((err, payload) => {
        if (payload) {
          log('Received message: ' + JSON.stringify(payload));
        }
        if (err) {
          reject(err);
          unsubscribe();
        } else if (payload?.text === 'user info received by the watch') {
          unsubscribe();
          const userInfo = payload && payload['user-info'];
          if (typeof userInfo === 'object') {
            resolve(userInfo);
          } else {
            reject(new Error('Invalid payload'));
          }
        }
      });

      log('sent user info: ' + JSON.stringify(userInfoToSend));
      log('waiting for acknowledgement from watch');
    });
  };
}
