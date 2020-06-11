import {IntegrationTest} from '../IntegrationTest';
import {TestLogFn} from './util';

import fs from 'react-native-fs';
import {subscribeToFileTransfers, transferFile} from '../../watch/files';

export class FileIntegrationTest extends IntegrationTest {
  constructor() {
    super('Files');
    this.registerTest('Files', 'reachable', this.testSendFile);
  }

  testSendFile = (log: TestLogFn) => {
    return new Promise((resolve, reject) => {
      let path = 'file://' + fs.MainBundlePath + '/Blah_Blah_Blah.jpg';

      log('transferring file: ' + path);

      const unsubscribeFromFileTransfers = subscribeToFileTransfers((event) => {
        log('event: ' + JSON.stringify(event));

        if (event.fractionCompleted === 1) {
          unsubscribeFromFileTransfers();
          resolve();
        }
      });

      transferFile(path).catch((err) => {
        unsubscribeFromFileTransfers();
        reject(err);
      });

      log('transferred file');
    });

    // TODO: Clean up susbcribes on test failure (need an after func)
  };
}
