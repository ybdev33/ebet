import React from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Header from '../../layout/header';
import { GlobalStyleSheet } from '../../constants/styleSheet';
import ListStyle1 from '../../components/list/ListStyle1';

const Footers = (props) => {

    const {colors} = useTheme();

    return (
        <>
            <SafeAreaView style={{flex:1,backgroundColor:colors.background}}>
                <Header title={'Footer styles'} titleLeft leftIcon={'back'}/>
                <ScrollView>
                    <View style={GlobalStyleSheet.container}>
                        <View
                            style={{
                                ...GlobalStyleSheet.card,
                                backgroundColor:colors.card,
                                ...GlobalStyleSheet.shadow,
                            }}
                        >
                            <ListStyle1 onPress={() => props.navigation.navigate('TabStyle1')} arrowRight title={'Footer Style 1'}/>
                            <ListStyle1 onPress={() => props.navigation.navigate('TabStyle2')} arrowRight title={'Footer Style 2'}/>
                            <ListStyle1 onPress={() => props.navigation.navigate('TabStyle3')} arrowRight title={'Footer Style 3'}/>
                            <ListStyle1 onPress={() => props.navigation.navigate('TabStyle4')} arrowRight title={'Footer Style 4'}/>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    );
};



export default Footers;