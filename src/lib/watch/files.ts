import {
  _subscribeToNativeWatchEvent,
  NativeWatchEvent,
  NativeWatchEventPayloads,
} from './events';
import {FileTransferInfo, NativeModule, WatchPayload} from './native-module';

export function subscribeToFileTransfers(
  cb: (
    event: NativeWatchEventPayloads[NativeWatchEvent.EVENT_FILE_TRANSFER_PROGRESS],
  ) => void,
) {
  const subscriptions = [
    _subscribeToNativeWatchEvent(
      NativeWatchEvent.EVENT_FILE_TRANSFER_PROGRESS,
      cb,
    ),
  ];
  return () => subscriptions.forEach((fn) => fn());
}

export function transferFile(
  uri: string,
  metadata: WatchPayload = {},
  cb?: (err: Error | null, info: FileTransferInfo | null) => void,
): Promise<FileTransferInfo> {
  return new Promise((resolve, reject) => {
    NativeModule.transferFile(
      uri,
      metadata,
      (resp) => {
        resolve(resp);
        if (cb) {
          cb(null, resp);
        }
      },
      (err) => {
        reject(err);
        if (cb) {
          cb(err, null);
        }
      },
    );
  });
}
