import {useCallback, useEffect, useState} from 'react';
import {sendWatchMessage} from '../watch/messages';
import {WatchState} from '../watch/state';
import {useWatchState} from '../watch/hooks/state';
import {useWatchReachability} from '../watch/hooks/reachability';

export function usePingPongEffect() {
  const [pongs, setPongs] = useState(0);

  const reachable = useWatchReachability();
  const state = useWatchState();

  const doPing = useCallback(() => {
    if (reachable && state === WatchState.Activated) {
      sendWatchMessage({ping: true}, (err) => {
        if (!err) {
          setPongs(pongs + 1);
        }
      });
    }
  }, [pongs, reachable, state]);

  useEffect(() => {
    const interval = setInterval(doPing, 2000);

    return () => clearInterval(interval);
  });

  return pongs;
}
