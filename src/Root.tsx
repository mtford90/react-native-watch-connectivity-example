import {StatusBar, StyleSheet, TextInput, View} from 'react-native';
import React, {useState} from 'react';

import Spinner from 'react-native-spinkit';

import {pickImage} from './images';
import {COLORS, ROW_MARGIN, WINDOW_WIDTH} from './constants';

import ReachabilityText from './ReachabilityText';
import WatchImage from './WatchImage';
import DualButton from './DualButton';
import LabeledSwitch from './LabeledSwitch';
import {
  sendMessageData,
  sendWatchMessage,
  transferFile,
  useWatchReachability,
  useWatchState,
} from './lib';
import {configureAnimation} from './animation';
import {KeyboardSpacer} from './KeyboardSpacer';
import {usePingPongEffect} from './hooks/use-ping-pong-effect';

type MessageToWatch = {text: string; timestamp: number};

export default function Root() {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [timeTakenToReachWatch, setTimeTakenToReachWatch] = useState<
    number | null
  >(null);
  const [fileTransferTime, setFileTransferTime] = useState<number | null>(null);
  const [timeTakenToReply, setTimeTakenToReply] = useState<number | null>(null);
  const [useFileAPI, setUseFileAPI] = useState(true);

  const watchState = useWatchState();
  const reachable = useWatchReachability();

  const pongs = usePingPongEffect();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <WatchImage pings={pongs} />
      <View>
        <ReachabilityText
          watchState={watchState}
          reachable={reachable}
          fileTransferTime={fileTransferTime}
          useDataAPI={!useFileAPI}
          timeTakenToReachWatch={timeTakenToReachWatch}
          timeTakenToReply={timeTakenToReply}
        />
      </View>
      <TextInput
        style={styles.textInput}
        value={text}
        onChangeText={setText}
        placeholder="Message"
      />
      {loading && <Spinner type="Bounce" color={COLORS.orange} size={44} />}
      {!loading && (
        <View>
          <DualButton
            textButtonDisabled={!text.trim().length || !reachable}
            imageButtonDisabled={!reachable}
            onTextButtonPress={() => {
              if (text.trim().length) {
                const timestamp = new Date().getTime();
                configureAnimation();
                setLoading(true);

                sendWatchMessage<
                  MessageToWatch,
                  {elapsed: number; timestamp: number}
                >({text, timestamp}, (err, resp) => {
                  if (!err && resp) {
                    // FIXME: If no error ,resp should not be null
                    console.log('response received', resp);
                    configureAnimation();

                    setTimeTakenToReachWatch(resp.elapsed || 0);
                    setTimeTakenToReply(new Date().getTime() - resp.timestamp);
                  } else {
                    console.error('error sending message to watch', err);
                  }

                  setLoading(false);
                });
              }
            }}
            onImageButtonPress={() => {
              pickImage('Send Image To Watch', !useFileAPI)
                .then(image => {
                  configureAnimation();
                  if (!image.didCancel) {
                    setLoading(true);
                    const startTransferTime = new Date().getTime();
                    let promise;

                    if (useFileAPI && image.uri) {
                      promise = transferFile(image.uri);
                    } else if (image.data) {
                      promise = sendMessageData(image.data);
                    } else {
                      promise = Promise.reject();
                    }

                    promise
                      .then(resp => {
                        const endTransferTime = new Date().getTime();
                        const elapsed = endTransferTime - startTransferTime;
                        console.log(
                          `successfully transferred in ${elapsed}ms`,
                          resp,
                        );
                        configureAnimation();

                        setFileTransferTime(elapsed);
                        setTimeTakenToReachWatch(null);
                        setTimeTakenToReply(null);
                        setLoading(false);
                      })
                      .catch(err => {
                        console.warn(
                          'Error sending message data',
                          err,
                          err.stack,
                        );
                        configureAnimation();
                        setLoading(false);
                      });
                  }
                })
                .catch(err => {
                  console.error('Error picking image', err);
                });
            }}
            disabled={!reachable}
          />
          <LabeledSwitch
            label={useFileAPI ? 'File API' : 'Data API'}
            switchProps={{
              value: useFileAPI,
              onValueChange: setUseFileAPI,
            }}
          />
        </View>
      )}
      <KeyboardSpacer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.purple,
    width: WINDOW_WIDTH,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    height: 60,
    width: 300,
    color: 'white',
    marginBottom: ROW_MARGIN,
    borderRadius: 6,
    padding: 20,
    alignSelf: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
