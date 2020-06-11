import {NativeEventEmitter} from 'react-native';
import {NativeModule, WatchPayload} from './native-module';

export const watchEmitter = new NativeEventEmitter(NativeModule);

export enum NativeWatchEvent {
  EVENT_FILE_TRANSFER_ERROR = 'WatchFileTransferError',
  EVENT_FILE_TRANSFER_FINISHED = 'WatchFileTransferFinished',
  EVENT_FILE_TRANSFER_PROGRESS = 'WatchFileTransferProgress',
  EVENT_RECEIVE_MESSAGE = 'WatchReceiveMessage',
  EVENT_WATCH_STATE_CHANGED = 'WatchStateChanged',
  EVENT_WATCH_REACHABILITY_CHANGED = 'WatchReachabilityChanged',
  EVENT_WATCH_USER_INFO_RECEIVED = 'WatchUserInfoReceived',
  EVENT_APPLICATION_CONTEXT_RECEIVED = 'WatchApplicationContextReceived',
}

export interface NativeWatchEventPayloads {
  [NativeWatchEvent.EVENT_FILE_TRANSFER_ERROR]: {error: Error};
  [NativeWatchEvent.EVENT_FILE_TRANSFER_FINISHED]: {
    uri: string;
    metadata: Record<string, unknown>;
    id: string;
  };
  [NativeWatchEvent.EVENT_RECEIVE_MESSAGE]: WatchPayload & {id?: string};
  [NativeWatchEvent.EVENT_WATCH_STATE_CHANGED]: {
    state:
      | 'WCSessionActivationStateNotActivated'
      | 'WCSessionActivationStateInactive'
      | 'WCSessionActivationStateActivated';
    installed: boolean;
    paired: boolean;
  };
  [NativeWatchEvent.EVENT_WATCH_REACHABILITY_CHANGED]: {
    reachability: boolean;
  };
  [NativeWatchEvent.EVENT_WATCH_USER_INFO_RECEIVED]: WatchPayload;
  [NativeWatchEvent.EVENT_APPLICATION_CONTEXT_RECEIVED]: WatchPayload | null;
  [NativeWatchEvent.EVENT_FILE_TRANSFER_PROGRESS]: {
    completedUnitCount: number;
    estimatedTimeRemaining: number | null;
    fileCompletedCount: number | null;
    fileTotalCount: number | null;
    cancellable: boolean;
    cancelled: boolean;
    fileURL: string;
    id: string;
    fractionCompleted: number;
    indeterminate: boolean;
    pausable: boolean;
    paused: boolean;
    throughput: number | null;
    totalUnitCount: number;
  };
}

export function _subscribeToNativeWatchEvent<
  E extends NativeWatchEvent,
  Payload = NativeWatchEventPayloads[E]
>(event: E, cb: (payload: Payload) => void) {
  // Type the event name
  if (!event) {
    throw new Error('Must pass event');
  }
  const sub = watchEmitter.addListener(event, cb);
  return () => sub.remove();
}
