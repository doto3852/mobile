import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {gyroscope} from 'react-native-sensors';
import RNFS from 'react-native-fs';

const App = () => {
  const [gyroData, setGyroData] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentValues, setCurrentValues] = useState({x: 0, y: 0, z: 0});
  const [isStair, setIsStair] = useState(0); // 계단 여부를 저장하는 상태

  useEffect(() => {
    let subscription: any;

    if (isRecording) {
      subscription = gyroscope.subscribe(({x, y, z}) => {
        setCurrentValues({x, y, z});
        setGyroData(prevData => [
          ...prevData,
          {
            x,
            y,
            z,
            timestamp: Date.now(),
            stair: isStair,
          },
        ]);
      });
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [isRecording, isStair]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRecording) {
      timer = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0',
    )}:${String(secs).padStart(2, '0')}`;
  };

  const startRecording = () => {
    setIsRecording(true);
    setGyroData([]); // 초기화
  };

  const stopRecording = async () => {
    setIsRecording(false);
    const path = `${RNFS.DownloadDirectoryPath}/gyroData.json`;
    await RNFS.writeFile(path, JSON.stringify(gyroData), 'utf8');
    console.log(`파일이 저장되었습니다: ${path}`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={isRecording ? stopRecording : startRecording}>
        <Text style={styles.buttonText}>
          {isRecording ? '저장 중지' : '저장 시작'}
        </Text>
      </TouchableOpacity>
      {isRecording && (
        <>
          <Text style={styles.timerText}>
            경과 시간: {formatTime(elapsedTime)}
          </Text>
          <Text style={styles.currentValuesText}>
            현재 값 - X: {currentValues.x.toFixed(2)}, Y:{' '}
            {currentValues.y.toFixed(2)}, Z: {currentValues.z.toFixed(2)}
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setIsStair(isStair === 1 ? 0 : 1)}>
              <Text style={styles.buttonText}>
                {isStair === 1 ? '계단 끝' : '계단 시작'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.stairText}>
            계단 여부: {isStair === 1 ? 'O' : 'X'}
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  timerText: {
    marginVertical: 10,
  },
  currentValuesText: {
    marginVertical: 10,
  },
  buttonContainer: {
    marginVertical: 20,
  },
  button: {
    height: 60, // 버튼 높이 설정
    justifyContent: 'center', // 수직 중앙 정렬
    alignItems: 'center', // 수평 중앙 정렬
    backgroundColor: '#007BFF', // 배경 색상
    borderRadius: 5, // 모서리 둥글기
  },
  buttonText: {
    fontSize: 24, // 글씨 크기 설정
    color: 'white', // 글씨 색상
  },
  stairText: {
    marginVertical: 10,
  },
});

export default App;
