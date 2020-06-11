import {WatchPayload, NativeModule, UserInfoQueue} from './native-module';
import {_subscribeToNativeWatchEvent, NativeWatchEvent} from './events';
import sortBy from 'lodash.sortby';

export type EnqueuedUserInfo<UserInfo extends WatchPayload = WatchPayload> = {
  userInfo: UserInfo;
  date: Date;
  id: string;
};

export function subscribeToUserInfo<
  UserInfo extends WatchPayload = WatchPayload
>(cb: (records: EnqueuedUserInfo<UserInfo>[]) => void) {
  // noinspection JSIgnoredPromiseFromCall
  return _subscribeToNativeWatchEvent<
    NativeWatchEvent.EVENT_WATCH_USER_INFO_RECEIVED,
    UserInfoQueue<UserInfo>
  >(NativeWatchEvent.EVENT_WATCH_USER_INFO_RECEIVED, (payload) => {
    cb(processUserInfoQueue(payload));
  });
}

export function sendUserInfo<UserInfo extends WatchPayload = WatchPayload>(
  info: UserInfo,
) {
  NativeModule.sendUserInfo(info);
}

function processUserInfoQueue<UserInfo extends WatchPayload = WatchPayload>(
  queue: UserInfoQueue<UserInfo>,
) {
  const userInfoArr: EnqueuedUserInfo<UserInfo>[] = sortBy(
    Object.entries(queue).map(([id, userInfo]) => ({
      id,
      userInfo,
      date: new Date(parseInt(id, 10)),
    })),
    (u) => u.date,
  );
  return userInfoArr;
}

export function getQueuedUserInfo<
  UserInfo extends WatchPayload = WatchPayload
>(): Promise<EnqueuedUserInfo<UserInfo>[]> {
  return new Promise((resolve) => {
    NativeModule.getUserInfo<UserInfo>((userInfoCache) => {
      const userInfoArr = processUserInfoQueue(userInfoCache);

      resolve(userInfoArr);
    });
  });
}

export function clearUserInfoQueue<
  UserInfo extends WatchPayload = WatchPayload
>(): Promise<EnqueuedUserInfo[]> {
  return new Promise((resolve) => {
    NativeModule.clearUserInfoQueue((cache) =>
      resolve(processUserInfoQueue(cache)),
    );
  });
}

type UserInfoId = string | Date | number | {id: string};

export function dequeueUserInfo(
  idOrIds: UserInfoId | Array<UserInfoId>,
): Promise<EnqueuedUserInfo[]> {
  const ids: Array<UserInfoId> = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
  const normalisedIds = ids.map((id) => {
    if (typeof id === 'object') {
      if (id instanceof Date) {
        return id.getTime().toString();
      } else {
        return id.id;
      }
    } else {
      return id.toString();
    }
  });

  return new Promise((resolve) => {
    NativeModule.dequeueUserInfo(normalisedIds, (queue) =>
      resolve(processUserInfoQueue(queue)),
    );
  });
}
