import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import BalanceChart from '../components/totalBalanceChart';
import BalanceWidgets from '../components/balanceWidgets';
import TopGainersLosers from '../components/topGainersLosers';
import { GlobalStyleSheet } from '../constants/styleSheet';

const Home = () => {

    const {colors} = useTheme();

    return(
        <View style={[{backgroundColor:colors.background,flex:1},Platform.OS === 'web' && GlobalStyleSheet.container,{padding:0}]}>
            <ScrollView showsHorizontalScrollIndicator={false}>
                <BalanceChart/>
                <Animatable.View
                    animation="fadeInRight" 
                    duration={1000}
                    delay={2000}
                >
                    <BalanceWidgets/>
                </Animatable.View>
                <Animatable.View
                    animation="fadeIn" 
                    duration={1000}
                    delay={2500}
                >
                    <TopGainersLosers/>
                </Animatable.View>
            </ScrollView>  
        </View>
    )
}

export default Home;