import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {gyroscope, accelerometer} from 'react-native-sensors';
import RNFS from 'react-native-fs';

type Subscription = {
  unsubscribe: () => void;
};

const App = () => {
  const [gyroData, setGyroData] = useState<any[]>([]);
  const [accelData, setAccelData] = useState<any[]>([]); // 가속도 데이터를 저장할 상태
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentGyroValues, setCurrentGyroValues] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [currentAccelValues, setCurrentAccelValues] = useState({
    ax: 0,
    ay: 0,
    az: 0,
  });
  const [isStair, setIsStair] = useState(0);

  useEffect(() => {
    let gyroSubscription: Subscription | null = null;
    let accelSubscription: Subscription | null = null;

    if (isRecording) {
      gyroSubscription = gyroscope.subscribe(({x, y, z}) => {
        setCurrentGyroValues({x, y, z});
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

      accelSubscription = accelerometer.subscribe(({x, y, z}) => {
        setCurrentAccelValues({ax: x, ay: y, az: z});
        setAccelData(prevData => [
          ...prevData,
          {
            ax: x,
            ay: y,
            az: z,
            timestamp: Date.now(),
            stair: isStair,
          },
        ]);
      });
    }

    return () => {
      if (gyroSubscription) {
        gyroSubscription.unsubscribe();
      }
      if (accelSubscription) {
        accelSubscription.unsubscribe();
      }
    };
  }, [isRecording, isStair]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

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
    setAccelData([]); // 초기화
  };

  const stopRecording = async () => {
    setIsRecording(false);
    const path = `${RNFS.DownloadDirectoryPath}/sensorData_${Date.now()}.json`;
    // const path = `${RNFS.DocumentDirectoryPath}/sensorData_${Date.now()}.json`;
    const combinedData = gyroData.map((gyro, index) => ({
      ...gyro,
      ...accelData[index], // 가속도 데이터를 합칩니다
    }));
    await RNFS.writeFile(path, JSON.stringify(combinedData), 'utf8');
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
            현재 자이로 값 - X: {currentGyroValues.x.toFixed(2)}, Y:{' '}
            {currentGyroValues.y.toFixed(2)}, Z:{' '}
            {currentGyroValues.z.toFixed(2)}
          </Text>
          <Text style={styles.currentValuesText}>
            현재 가속도 값 - AX: {currentAccelValues.ax.toFixed(2)}, AY:{' '}
            {currentAccelValues.ay.toFixed(2)}, AZ:{' '}
            {currentAccelValues.az.toFixed(2)}
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
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 24,
    color: 'white',
  },
  stairText: {
    marginVertical: 10,
  },
});

export default App;
