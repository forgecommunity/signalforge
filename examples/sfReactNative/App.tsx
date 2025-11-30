/**
 * SignalForge Complete Demo App
 * Demonstrates all features from the README
 *
 * @format
 */

import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

// Import screens
import BasicSignalScreen from './screens/BasicSignalScreen';
import ComputedSignalScreen from './screens/ComputedSignalScreen';
import EffectsScreen from './screens/EffectsScreen';
import BatchUpdatesScreen from './screens/BatchUpdatesScreen';
import SubscribeScreen from './screens/SubscribeScreen';
import UntrackScreen from './screens/UntrackScreen';
import ReactHooksScreen from './screens/ReactHooksScreen';
import ShoppingCartScreen from './screens/ShoppingCartScreen';
import FormValidationScreen from './screens/FormValidationScreen';
import TodoAppScreen from './screens/TodoAppScreen';
import ArraySignalScreen from './screens/ArraySignalScreen';
import PersistentSignalScreen from './screens/PersistentSignalScreen';
import TimeTravelScreen from './screens/TimeTravelScreen';
import DevToolsScreen from './screens/DevToolsScreen';
import BigDataScreen from './screens/BigDataScreen';
import ClassComponentScreen from './screens/ClassComponentScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [currentScreen, setCurrentScreen] = useState<string>('home');

  const screens = [
    { id: 'basic', title: '1. Basic Signal', component: BasicSignalScreen },
    { id: 'computed', title: '2. Computed Signal', component: ComputedSignalScreen },
    { id: 'effects', title: '3. Effects', component: EffectsScreen },
    { id: 'batch', title: '4. Batch Updates', component: BatchUpdatesScreen },
    { id: 'subscribe', title: '5. Subscribe', component: SubscribeScreen },
    { id: 'untrack', title: '6. Untrack', component: UntrackScreen },
    { id: 'hooks', title: '7. React Hooks', component: ReactHooksScreen },
    { id: 'cart', title: '8. Shopping Cart', component: ShoppingCartScreen },
    { id: 'form', title: '9. Form Validation', component: FormValidationScreen },
    { id: 'todo', title: '10. Todo App', component: TodoAppScreen },
    { id: 'array', title: '11. Array Signal', component: ArraySignalScreen },
    { id: 'persist', title: '12. Persistent Signal', component: PersistentSignalScreen },
    { id: 'timetravel', title: '13. Time Travel ⏱️', component: TimeTravelScreen },
    { id: 'devtools', title: '14. DevTools 🛠️', component: DevToolsScreen },
    { id: 'class', title: '15. Class Components', component: ClassComponentScreen },
    { id: 'bigdata', title: '16. Big Data 📊', component: BigDataScreen },
  ];

  const CurrentScreenComponent = screens.find(s => s.id === currentScreen)?.component;

  if (currentScreen === 'home') {
    return (
      <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⚡ SignalForge Demo</Text>
          <Text style={styles.headerSubtitle}>Choose a demo to explore</Text>
        </View>
        <ScrollView style={styles.menuScroll}>
          {screens.map((screen) => (
            <TouchableOpacity
              key={screen.id}
              style={styles.menuItem}
              onPress={() => setCurrentScreen(screen.id)}
            >
              <Text style={styles.menuItemText}>{screen.title}</Text>
              <Text style={styles.menuItemArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <View style={styles.screenHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>
          {screens.find(s => s.id === currentScreen)?.title}
        </Text>
      </View>
      {CurrentScreenComponent && <CurrentScreenComponent />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  menuScroll: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#6366f1',
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#6366f1',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 15,
    flex: 1,
  },
});

export default App;
