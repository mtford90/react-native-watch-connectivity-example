import {NativeEventEmitter} from 'react-native';
import {NativeModule, QueuedUserInfo, WatchPayload} from './native-module';

export const watchEmitter = new NativeEventEmitter(NativeModule);

export enum NativeWatchEvent {
  EVENT_FILE_TRANSFER_ERROR = 'WatchFileTransferError',
  EVENT_FILE_TRANSFER_FINISHED = 'WatchFileTransferFinished',
  EVENT_FILE_TRANSFER_PROGRESS = 'WatchFileTransferProgress',
  EVENT_FILE_TRANSFER_STARTED = 'WatchFileTransferStarted',
  EVENT_RECEIVE_MESSAGE = 'WatchReceiveMessage',
  EVENT_WATCH_STATE_CHANGED = 'WatchStateChanged',
  EVENT_WATCH_REACHABILITY_CHANGED = 'WatchReachabilityChanged',
  EVENT_WATCH_USER_INFO_RECEIVED = 'WatchUserInfoReceived',
  EVENT_APPLICATION_CONTEXT_RECEIVED = 'WatchApplicationContextReceived',
}

export interface NativeWatchEventPayloads {
  [NativeWatchEvent.EVENT_FILE_TRANSFER_ERROR]: {
    error: Error;
    uri: string;
    metadata: Record<string, unknown>;
    id: string;
  };
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
  [NativeWatchEvent.EVENT_WATCH_USER_INFO_RECEIVED]: QueuedUserInfo<
    WatchPayload
  >;
  [NativeWatchEvent.EVENT_APPLICATION_CONTEXT_RECEIVED]: WatchPayload | null;
  [NativeWatchEvent.EVENT_FILE_TRANSFER_PROGRESS]: {
    completedUnitCount: number;
    estimatedTimeRemaining: number | null;
    fractionCompleted: number;
    throughput: number | null;
    totalUnitCount: number;
    uri: string;
    metadata: Record<string, unknown>;
    id: string;
  };
  [NativeWatchEvent.EVENT_FILE_TRANSFER_STARTED]: {
    uri: string;
    metadata: Record<string, unknown>;
    id: string;
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
