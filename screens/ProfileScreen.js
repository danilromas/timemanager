import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart } from 'react-native-chart-kit';
import { Svg, Rect, Text as SvgText } from 'react-native-svg';

export default function ProfileScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState({
    '2024-11-16': [
      { task: 'Подготовка отчёта', startTime: '14:00', duration: 2 },
      { task: 'Созвон с командой', startTime: '16:00', duration: 1 },
    ],
    '2024-11-17': [
      { task: 'Проверка почты', startTime: '9:00', duration: 1 },
      { task: 'Работа над проектом', startTime: '11:00', duration: 3 },
    ],
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'gantt'

  const onDayPress = (day) => setSelectedDate(day.dateString);

  const addTask = () => {
    if (!selectedDate) {
      Alert.alert('Ошибка', 'Выберите дату!');
      return;
    }
    if (task.trim() === '' || !selectedTime) {
      Alert.alert('Ошибка', 'Введите задачу и выберите время!');
      return;
    }
    const newTask = { task, startTime: selectedTime, duration: 1 }; // По умолчанию длительность 1 час
    setTasks((prev) => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), newTask],
    }));
    Alert.alert('Задача добавлена', `Задача: "${task}" в ${selectedTime}`);
    setTask('');
    setSelectedTime('');
  };

  const onTimeChange = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      setSelectedTime(`${hours}:${minutes < 10 ? `0${minutes}` : minutes}`);
    }
  };

  const ganttData = Object.entries(tasks).flatMap(([date, taskList]) =>
    taskList.map((task, index) => ({
      id: `${date}-${index}`,
      name: task.task,
      startDate: date,
      startTime: task.startTime,
      duration: task.duration, // Длительность задачи в часах
    }))
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Управление задачами</Text>

      {/* Переключение режимов */}
      <View style={styles.viewSwitcher}>
        <TouchableOpacity
          style={[
            styles.switchButton,
            viewMode === 'calendar' && styles.switchButtonActive,
          ]}
          onPress={() => setViewMode('calendar')}
        >
          <Text style={styles.switchButtonText}>Календарь</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.switchButton,
            viewMode === 'gantt' && styles.switchButtonActive,
          ]}
          onPress={() => setViewMode('gantt')}
        >
          <Text style={styles.switchButtonText}>Диаграмма Ганта</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'calendar' ? (
        <ScrollView>
          <Calendar
            onDayPress={onDayPress}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: 'blue',
                selectedTextColor: 'white',
              },
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="Введите задачу"
            value={task}
            onChangeText={setTask}
          />
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.timeButtonText}>
              {selectedTime || 'Выберите время'}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              mode="time"
              value={new Date()}
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          )}
          <TouchableOpacity style={styles.addButton} onPress={addTask}>
            <Text style={styles.addButtonText}>Добавить задачу</Text>
          </TouchableOpacity>
          {tasks[selectedDate]?.length > 0 ? (
            <View style={styles.taskList}>
              {tasks[selectedDate].map((item, index) => (
                <Text key={index} style={styles.taskItem}>
                  {item.startTime} - {item.task}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.noTasks}>Нет задач для выбранной даты</Text>
          )}
        </ScrollView>
      ) : (
        <ScrollView horizontal>
          <ScrollView>
            <Svg height={ganttData.length * 60 + 40} width={800}>
              {/* Шкала времени */}
              {Array.from({ length: 24 }, (_, i) => (
                <React.Fragment key={i}>
                  <SvgText
                    x={i * 30 + 120}
                    y="20"
                    fontSize="12"
                    fill="black"
                    textAnchor="middle"
                  >
                    {`${i}:00`}
                  </SvgText>
                  <Rect
                    x={i * 30 + 120}
                    y="30"
                    width="1"
                    height={ganttData.length * 60}
                    fill="#ccc"
                  />
                </React.Fragment>
              ))}

              {/* Задачи */}
              {ganttData.map((item, index) => {
                const startHours = parseInt(item.startTime.split(':')[0], 10);
                const startX = 120 + startHours * 30;
                const width = item.duration * 30;

                return (
                  <React.Fragment key={item.id}>
                    {/* Горизонтальная линия */}
                    <Rect
                      x="0"
                      y={index * 60 + 40}
                      width="100%"
                      height="1"
                      fill="#ddd"
                    />

                    {/* Имя задачи */}
                    <SvgText
                      x="10"
                      y={index * 60 + 60}
                      fontSize="14"
                      fill="black"
                      textAnchor="start"
                    >
                      {item.name}
                    </SvgText>

                    {/* Прямоугольник задачи */}
                    <Rect
                      x={startX}
                      y={index * 60 + 50}
                      width={width}
                      height="20"
                      fill="blue"
                      rx="5"
                      ry="5"
                    />
                  </React.Fragment>
                );
              })}
            </Svg>
          </ScrollView>
        </ScrollView>
      )}

      <Text style={styles.chartTitle}>Статистика задач за последние 7 дней</Text>
      <LineChart
        data={{
          labels: Object.keys(tasks).slice(-7),
          datasets: [
            {
              data: Object.keys(tasks).slice(-7).map((date) => tasks[date]?.length || 0),
            },
          ],
        }}
        width={320}
        height={220}
        chartConfig={{
          backgroundColor: '#e26a00',
          backgroundGradientFrom: '#fb8c00',
          backgroundGradientTo: '#ffa726',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  viewSwitcher: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  switchButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#007bff',
    alignItems: 'center',
    borderRadius: 5,
  },
  switchButtonActive: { backgroundColor: '#007bff' },
  switchButtonText: { color: '#fff', fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  timeButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 5, alignItems: 'center' },
  timeButtonText: { color: '#fff' },
  addButton: { backgroundColor: 'green', padding: 10, borderRadius: 5, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  taskList: { marginTop: 20 },
  taskItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
  noTasks: { textAlign: 'center', color: '#999', marginTop: 20 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  chart: { marginVertical: 8, borderRadius: 16 },
});
