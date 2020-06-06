import * as React from 'react';
import Drawer from './navigators/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {TestRunnerProvider} from './lib/tests/context';
import {useMemo} from 'react';
import TestRunner from './lib/tests/TestRunner';
import {configure} from 'mobx';

import 'mobx-react-lite/batchingForReactNative';

configure({
  enforceActions: 'always',
});

export default function App() {
  const testRunner = useMemo(() => new TestRunner(), []);

  return (
    <TestRunnerProvider value={testRunner}>
      <NavigationContainer>
        <Drawer />
      </NavigationContainer>
    </TestRunnerProvider>
  );
}
