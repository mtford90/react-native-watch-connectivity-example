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
import {Test} from '../lib/testing/tests';
import {useTestRunner} from '../lib/testing/TestRunner/context';
import {observer} from 'mobx-react-lite';
import Icon from '../components/Icon';
import {COLORS} from '../constants';

const styles = StyleSheet.create({
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
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
  sectionHeader: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
});

const TestItem = observer(({item}: {item: Test}) => {
  const testRunner = useTestRunner();

  const state = testRunner.testStatus[item.name];

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
          disabled={testRunner.running}
          onPress={() => {
            testRunner.runTest(item.name);
          }}>
          <Text style={styles.runButtonText}>Run</Text>
        </TouchableOpacity>
      </View>
      {(Boolean(logs.length) || state.status === 'failed') && (
        <View style={styles.logs}>
          {logs.map(([ts, log]) => (
            <Text key={ts} style={styles.logText}>
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
  const testRunner = useTestRunner();

  return (
    <Layout title="tests">
      <SectionList
        sections={testRunner.tests}
        stickySectionHeadersEnabled={false}
        keyExtractor={(item) => item.name}
        renderSectionHeader={({section}) => {
          return (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <TouchableOpacity
                disabled={testRunner.running}
                onPress={() => {
                  testRunner.runTests(section.data.map((d) => d.name));
                }}>
                <Text style={styles.runButtonText}>Run All</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        renderItem={({item}) => {
          return <TestItem item={item} />;
        }}
      />
    </Layout>
  );
};

export default TestsScreen;
