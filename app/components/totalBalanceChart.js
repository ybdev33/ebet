import React, {useEffect, useState, useCallback} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ImageBackground,
    Platform, Modal,
} from 'react-native';

import FeatherIcon from 'react-native-vector-icons/Feather';
import * as Animatable from 'react-native-animatable';
// import {Defs, LinearGradient, Stop} from "react-native-svg";
import { FONTS, SIZES, COLORS, ICONS, IMAGES } from '../constants/theme';
import { useNavigation, useTheme } from '@react-navigation/native';
// import { VictoryArea, VictoryChart } from 'victory-native';
import { LineChart } from 'react-native-chart-kit';
import Svg, { Rect , Text as TextSVG } from 'react-native-svg';
import { GlobalStyleSheet } from '../constants/styleSheet';

const BalanceChart = ({headerTitle,header, amount}) => {

    const {colors} = useTheme();

    const navigation = useNavigation();

    return(
        
        <ImageBackground 
            source={IMAGES.bg1}
            style={[{
                alignItems:'center',
                backgroundColor:COLORS.secondary,
                paddingBottom:20,
                borderBottomLeftRadius:20,
                borderBottomRightRadius:20,
                overflow:'hidden',
            }, header === false && {
                paddingTop:30,
            }, Platform.OS === 'web' && GlobalStyleSheet.container,{padding:0}]}
        >
            {header != false &&
                <View
                    style={{
                        paddingHorizontal:15,
                        paddingVertical:10,
                        flexDirection:'row',
                        width:'100%',
                        alignItems:'center',
                        marginBottom:5,
                    }}
                >
                    <Text style={{...FONTS.h6,color:COLORS.white,flex:1}}>{headerTitle ? headerTitle : "Home"}</Text>

                    <TouchableOpacity
                        onPress={() => navigation.openDrawer()}
                        style={{
                            height:40,
                            width:40,
                            borderRadius:SIZES.radius,
                            alignItems:'center',
                            justifyContent:'center',
                            backgroundColor:'rgba(255,255,255,.1)',
                        }}
                    >
                        <FeatherIcon
                            name='grid'
                            size={20}
                            color={COLORS.white}
                        />
                    </TouchableOpacity>
                </View>
            }
            <Animatable.Text 
                animation="zoomInUp" 
                duration={1000}
                delay={500}
                style={{
                    ...FONTS.fontXs,
                    color:'rgba(255,255,255,.6)',
                    marginBottom:8,
                }}>Total Balance</Animatable.Text>
            <Animatable.Text 
                animation="zoomInUp" 
                duration={1000}
                delay={500}
                style={{...FONTS.h2,color:COLORS.white}}>₱ {amount}</Animatable.Text>
            <View
                style={{
                    flexDirection:'row',
                    alignItems:'center',
                    backgroundColor:'rgba(255,255,255,.1)',
                    borderRadius:30,
                    paddingHorizontal:20,
                    paddingVertical:6,
                    marginTop:8,
                }}
            >
            </View>
        </ImageBackground>
    )
}


const styles = StyleSheet.create({
    tabBtn:{
        paddingHorizontal:10,
        paddingVertical:4,
        width:50,
        alignItems:'center',
        borderRadius:4,
        marginHorizontal:3,
    },
    btnTabActive:{
        backgroundColor:COLORS.white,
    },
    btnTabActiveText:{
        color:COLORS.title,
    }
})


export default BalanceChart;