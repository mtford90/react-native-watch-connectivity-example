import {WatchPayload} from '../native-module';
import {getQueuedUserInfo, subscribeToUserInfo, EnqueuedUserInfo} from '../user-info';
import {useEffect, useState} from 'react';

export function useUserInfo<UserInfo extends WatchPayload = WatchPayload>() {
  const [userInfo, setUserInfo] = useState<EnqueuedUserInfo<UserInfo>[]>([]);

  useEffect(() => {
    getQueuedUserInfo<UserInfo>().then(setUserInfo);
    return subscribeToUserInfo<UserInfo>(setUserInfo);
  }, []);

  return userInfo;
}
