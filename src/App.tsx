import * as React from 'react';
import Drawer from './navigators/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {TestRunnerProvider} from './lib/testing/TestRunner/context';
import {useEffect, useMemo} from 'react';
import TestRunner from './lib/testing/TestRunner';
import {configure} from 'mobx';
import 'bluebird-global';

Promise.config({
  longStackTraces: true,
  warnings: {
    // async/await seems to screw with bluebird and generate false warnings...
    wForgottenReturn: false,
  },
});

import 'mobx-react-lite/batchingForReactNative';
import tests from './lib/testing/tests';
import {activateWatchSession} from './lib/watch';

configure({
  enforceActions: 'observed',
});

export default function App() {
  const testRunner = useMemo(() => new TestRunner(tests), []);

  useEffect(() => {
    activateWatchSession();
  }, []);

  return (
    <TestRunnerProvider value={testRunner}>
      <NavigationContainer>
        <Drawer />
      </NavigationContainer>
    </TestRunnerProvider>
  );
}
