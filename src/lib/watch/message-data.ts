import {Encoding} from './encoding';
import {NativeModule} from './native-module';
import {atob} from './base64';

export function sendMessageData(
  data: string,
  cb: (err: Error | null, response: string | null) => void = () => {},
  encoding: Encoding = Encoding.NSUTF8StringEncoding,
): Promise<string> {
  return new Promise((resolve, reject) => {
    NativeModule.sendMessageData(
      data,
      encoding,
      (resp) => {
        const decoded = atob(resp)
        cb(null, decoded);
        resolve(decoded);
      },
      (err) => {
        cb(err, null);
        reject(err);
      },
    );
  });
}
