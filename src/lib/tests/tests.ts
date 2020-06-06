import {sendWatchMessage, subscribeToMessages} from '../watch/messages';

export interface Test {
  name: string;
  run: (log: (str: string) => void) => Promise<void>;
}

export interface TestSection {
  title: string;
  data: Test[];
}

const tests: TestSection[] = [
  {
    title: 'Messages',
    data: [
      {
        name: 'Send message',
        run: (log) => {
          return new Promise((resolve, reject) => {
            sendWatchMessage(
              {test: true, text: 'Reply to this message'},
              (err, reply) => {
                if (reply) {
                  log('received message: ' + JSON.stringify(reply));
                }
                if (err) {
                  reject(err);
                } else if (reply && reply.text === 'Here is your reply') {
                  resolve();
                } else {
                  reject(new Error('Incorrect response'));
                }
              },
            );
            log('sent message');
          });
        },
      },
      {
        name: 'Subscribe to messages',
        run: async (log) => {
          return new Promise((resolve) => {
            const unsubscribe = subscribeToMessages((_err, message) => {
              log('Received message ' + JSON.stringify(message));
              if (message?.text === "Here's your message") {
                unsubscribe();
                log('Unsubscribed');
                resolve();
              }
            });
            log('Subscribed to messages');
            let message = {test: true, text: 'Send me a message, please'};
            sendWatchMessage(message);
            log('Sent message: ' + JSON.stringify(message));
          });
        },
      },
      {
        name: 'Reply to messages from watch',
        run: async (log) => {
          return new Promise((resolve, reject) => {
            let receivedFirstMessage = false;
            const unsubscribe = subscribeToMessages((_err, message, reply) => {
              log('Received message ' + JSON.stringify(message));
              if (message?.text === "Here's your message") {
                receivedFirstMessage = true;
                log('Replied');
                if (reply) {
                  reply({test: true, text: "And here's a response"});
                } else {
                  unsubscribe();
                  reject(new Error('Missing reply handler'));
                }
              } else if (message?.text === 'Received your reply!') {
                if (receivedFirstMessage) {
                  log('The watch received our reply!');
                  unsubscribe();
                  resolve();
                } else {
                  unsubscribe();
                  reject(new Error(''));
                }
              }
            });
            log('Subscribed to messages');
            sendWatchMessage({test: true, text: 'Send me a message, please'});
            log('Sent message');
          });
        },
      },
    ],
  },
  {
    title: 'User Info',
    data: [
      {
        name: 'Send user info',
        run: async () => {
          return;
        },
      },
      {
        name: 'Receive user info',
        run: async () => {
          return;
        },
      },
    ],
  },
];

export default tests;
