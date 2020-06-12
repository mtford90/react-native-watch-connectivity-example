import {
  _subscribeToNativeWatchEvent,
  NativeWatchEvent,
  NativeWatchEventPayloads,
} from './events';
import {FileTransferInfo, NativeModule, WatchPayload} from './native-module';

export function subscribeToFileTransfers(
  cb: (
    event:
      | ({
          type: NativeWatchEvent.EVENT_FILE_TRANSFER_FINISHED;
        } & NativeWatchEventPayloads[NativeWatchEvent.EVENT_FILE_TRANSFER_FINISHED])
      | ({
          type: NativeWatchEvent.EVENT_FILE_TRANSFER_ERROR;
        } & NativeWatchEventPayloads[NativeWatchEvent.EVENT_FILE_TRANSFER_ERROR])
      | ({
          type: NativeWatchEvent.EVENT_FILE_TRANSFER_STARTED;
        } & NativeWatchEventPayloads[NativeWatchEvent.EVENT_FILE_TRANSFER_STARTED])
      | ({
          type: NativeWatchEvent.EVENT_FILE_TRANSFER_PROGRESS;
        } & NativeWatchEventPayloads[NativeWatchEvent.EVENT_FILE_TRANSFER_PROGRESS]),
  ) => void,
) {
  const subscriptions = [
    _subscribeToNativeWatchEvent(
      NativeWatchEvent.EVENT_FILE_TRANSFER_ERROR,
      (payload) =>
        cb({type: NativeWatchEvent.EVENT_FILE_TRANSFER_ERROR, ...payload}),
    ),
    _subscribeToNativeWatchEvent(
      NativeWatchEvent.EVENT_FILE_TRANSFER_FINISHED,
      (payload) =>
        cb({type: NativeWatchEvent.EVENT_FILE_TRANSFER_FINISHED, ...payload}),
    ),
    _subscribeToNativeWatchEvent(
      NativeWatchEvent.EVENT_FILE_TRANSFER_STARTED,
      (payload) =>
        cb({type: NativeWatchEvent.EVENT_FILE_TRANSFER_STARTED, ...payload}),
    ),
    _subscribeToNativeWatchEvent(
      NativeWatchEvent.EVENT_FILE_TRANSFER_PROGRESS,
      (payload) =>
        cb({type: NativeWatchEvent.EVENT_FILE_TRANSFER_PROGRESS, ...payload}),
    ),
  ];

  return () => subscriptions.forEach((fn) => fn());
}

export function startFileTransfer(
  uri: string,
  metadata: WatchPayload = {},
): Promise<FileTransferInfo> {
  return new Promise((resolve, reject) => {
    NativeModule.transferFile(uri, metadata, resolve, reject);
  });
}
