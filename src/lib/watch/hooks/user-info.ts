import {WatchPayload} from '../native-module';
import {getUserInfo, subscribeToUserInfo} from '../user-info';
import {useEffect, useState} from 'react';

export function useUserInfo<UserInfo extends WatchPayload = WatchPayload>() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    getUserInfo<UserInfo>().then(setUserInfo);
    return subscribeToUserInfo<UserInfo>(setUserInfo);
  }, []);

  return userInfo;
}
