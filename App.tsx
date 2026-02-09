import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Routes from './app/Navigations/Routes';
import { useFonts } from 'expo-font';
import Constants from 'expo-constants';
import { Text } from 'react-native';
import { COLORS } from './app/constants/theme'; // Make sure the path is correct

const App = () => {

    const [loaded] = useFonts({
        PoppinsRegular: require('./app/assets/fonts/Poppins-Regular.ttf'),
        PoppinsSemiBold : require('./app/assets/fonts/Poppins-SemiBold.ttf'),
        PoppinsMedium : require('./app/assets/fonts/Poppins-Medium.ttf'),
    });

    if(!loaded){
        return null;
    }

    const detectedPort = typeof window !== 'undefined' ? window.location.port : '';

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1 }}>
                {(detectedPort === '8081' || detectedPort === '6049') && (
                    <Text
                        style={{
                            backgroundColor: '#9a000f',
                            color: '#fff',
                            fontSize: 15,
                            textAlign: 'center',
                            paddingVertical: 5,
                        }}
                    >
                        ⚠️ You are running in DEV Mode
                    </Text>
                )}
                <Routes/>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default App;
