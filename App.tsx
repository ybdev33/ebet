import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Routes from './app/Navigations/Routes';
import { useFonts } from 'expo-font';

const App = () =>{

		const [loaded] = useFonts({
        PoppinsRegular: require('./app/assets/fonts/Poppins-Regular.ttf'),
        PoppinsSemiBold : require('./app/assets/fonts/Poppins-SemiBold.ttf'),
        PoppinsMedium : require('./app/assets/fonts/Poppins-Medium.ttf'),
		});

		if(!loaded){
		  return null;
		}

    return (
        <SafeAreaProvider>
          <SafeAreaView
            style={{
                flex: 1,
                // paddingTop:Platform.OS === 'web' ? 0 : 35,
              }}
            >
              <Routes/>
          </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default App;
