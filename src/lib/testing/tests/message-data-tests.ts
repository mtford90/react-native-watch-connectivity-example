import {IntegrationTest} from '../IntegrationTest';
import {sendMessageData} from '../../watch/message-data';
import {TestLogFn} from './util';

export class MessageDataIntegrationTest extends IntegrationTest {
  constructor() {
    super('Message Data');
    this.registerTest(
      'Send message data',
      'reachable',
      this.testSendMessageData,
    );
  }

  async testSendMessageData(log: TestLogFn) {
    const data = 'hello';

    log(`Sending message data: ${data}`);

    const response = await sendMessageData(data);

    log(`Received response: ${response}`);

    if (response !== 'hi there') {
      throw new Error('Invalid response');
    }
  }
}
