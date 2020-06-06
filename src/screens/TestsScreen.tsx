import Layout from '../components/Layout';
import React from 'react';
import {
  Text,
  SectionList,
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import tests, {Test} from '../lib/tests/tests';
import {useTestRunner} from '../lib/tests/context';
import {observer} from 'mobx-react-lite';
import Icon from '../components/Icon';
import {COLORS} from '../constants';

const styles = StyleSheet.create({
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 10,
    paddingBottom: 10,
  },
  test: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  testText: {
    color: 'white',
    paddingLeft: 10,
    flex: 1,
  },
  runButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: 15,
  },
  errorIconContainer: {
    backgroundColor: COLORS.orange,
  },
  passIconContainer: {
    backgroundColor: COLORS.green.darkest,
  },
  logText: {
    color: 'white',
    fontFamily: 'JetBrainsMono-Medium',
    marginTop: 10,
  },
  errorText: {
    color: COLORS.orange,
  },
  logs: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
});

const TestItem = observer(({item}: {item: Test}) => {
  const testRunner = useTestRunner();

  const state = testRunner.testStatus[item.name];

  console.log('status', state);

  const logs = testRunner.logs[item.name] || [];

  return (
    <View>
      <View style={styles.test}>
        {state.status === 'running' && (
          <ActivityIndicator color="white" size="small" />
        )}
        {state.status === 'failed' && (
          <View style={[styles.iconContainer, styles.errorIconContainer]}>
            <Icon name="cross" color="white" height={12} width={12} />
          </View>
        )}
        {state.status === 'passed' && (
          <View style={[styles.iconContainer, styles.passIconContainer]}>
            <Icon name="tick" color="white" height={12} width={12} />
          </View>
        )}
        <Text style={styles.testText}>{item.name}</Text>
        <TouchableOpacity
          disabled={state.status === 'running'}
          onPress={() => {
            testRunner.runTest(item.name);
          }}>
          <Text style={styles.runButtonText}>Run</Text>
        </TouchableOpacity>
      </View>
      {(Boolean(logs.length) || state.status === 'failed') && (
        <View style={styles.logs}>
          {logs.map((log) => (
            <Text key={log} style={styles.logText}>
              {log}
            </Text>
          ))}
          {state.status === 'failed' && (
            <Text style={[styles.logText, styles.errorText]}>
              {state.error.message}
            </Text>
          )}
        </View>
      )}
    </View>
  );
});

const TestsScreen = function TestsScreen() {
  return (
    <Layout title="tests">
      <SectionList
        sections={tests}
        keyExtractor={(item) => item.name}
        renderSectionHeader={({section}) => {
          return <Text style={styles.sectionTitle}>{section.title}</Text>;
        }}
        renderItem={({item}) => {
          return <TestItem item={item} />;
        }}
      />
    </Layout>
  );
};

export default TestsScreen;
