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
import SuccessModal from "../components/modal/SuccessModal";
import {getSession} from "../helpers/sessionHelper";
import Constants from 'expo-constants';
import { useFocusEffect } from '@react-navigation/native';

const { GAMING_DOMAIN } = Constants.expoConfig?.extra || {};

const chartTab = [
    {
        status : '1H'
    },
    {
        status : '1D'
    },
    {
        status : '1W'
    },
    {
        status : '1M'
    },
    {
        status : '1Y'
    },
    {
        status : 'All'
    }
]


const hourData = [50,20,30,20,20,60];
const dayData = [35,20,45,50,35,60,45,70,35];
const weekData = [40,55,31,65,45,55,42,30,65];
const monthData = [60,50,45,38,20,45,65,28,45,52];
const yearData = [25,35,50,32,25,52,62,34,45,25];
const allData = [20,40,35,50,25,60,50,70,60,75,20,50,43];

const BalanceChart = ({headerTitle,header}) => {

    const {colors} = useTheme();

    const navigation = useNavigation();

    let [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false, value: 0 })

    const [status , setStatus] = useState('All');
    const [chartdata, setChartdata] = useState(allData);
    
    const setChartStatusFilter = status => {
        switch(status){
            case "1H":
                setChartdata(hourData);
                break;
            case "1D":
                setChartdata(dayData);
                break;
            case "1W":
                setChartdata(weekData);
                break;
            case "1M":
                setChartdata(monthData);
                break;
            case "1Y":
                setChartdata(yearData);
                break; 
            case "All":
                setChartdata(allData);
                break;
        }
        setStatus(status)
    }

    const [amount, setAmount] = useState("Loading...");

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            (async () => {
                try {
                    const user = await getSession('userSession');
                    const userId = user.data.userId;

                    const response = await fetch(`${GAMING_DOMAIN}/api/ApplicationUsers/GetUserLoad?userId=${userId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            // Authorization: 'Settings a2luZ3MzOiF0ZXJ5U3dldGk=',
                        }
                    });

                    const result = await response.json();

                    if (response.ok) {
                        const fetchedAmount = result.data?.amount;
                        setAmount(fetchedAmount);
                    }
                } catch (error) {
                    setModalMessage('Something went wrong. Please try again later.');
                    setIsSuccess(false);
                    setModalVisible(true);
                }
            })();

            return () => {
                isActive = false;
            };
        }, [])
    );

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
                        onPress={() => navigation.navigate('notifications')}
                        style={{
                            height:40,
                            width:40,
                            borderRadius:SIZES.radius,
                            alignItems:'center',
                            justifyContent:'center',
                            backgroundColor:'rgba(255,255,255,.1)',
                            marginRight:6,
                        }}
                    >
                        <Image
                            source={ICONS.bell}
                            style={{
                                height:20,
                                width:20,
                            }}
                        />
                        <View
                            style={{
                                height:5,
                                width:5,
                                borderRadius:6,
                                backgroundColor:"#B94646",
                                position:'absolute',
                                top:14,
                                right:13,
                            }}
                        />
                    </TouchableOpacity>
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
                <Text style={{...FONTS.fontXs,color:"rgba(255,255,255,.6)",lineHeight:16}}>BTC: 0,00335</Text>
                <Text style={{...FONTS.fontXs,color:COLORS.primary,lineHeight:16,...FONTS.fontMedium}}>+5.64%</Text>
            </View>
            <View style={{width:SIZES.width > SIZES.container ? SIZES.container: SIZES.width,alignItems:'flex-start',paddingTop:10,marginLeft:-150}}>
                <LineChart
                    data={{
                        datasets: [{
                            data: chartdata,
                            color: (opacity = 1) => COLORS.primary,
                        }]
                    }}
                    width={SIZES.width + 150 > SIZES.container ? SIZES.container + 150 : SIZES.width + 150} // from react-native
                    height={165}
                    transparent={true}
                    bezier
                    withHorizontalLabels={false}
                    withVerticalLabels={false}
                    withVerticalLines={false}
                    chartConfig={{
                        strokeWidth:2,
                        fillShadowGradientFrom:COLORS.primary,
                        fillShadowGradientFromOpacity:.3,
                        fillShadowGradientTo:'transparent',
                        fillShadowGradientToOpacity:0,
                        fillShadowGradientFromOffset:(1 - 0.8),
                        fillShadowGradientToOffset:(1 - 0.1),
                        decimalPlaces: 2, // optional, defaults to 2dp
                        color: (opacity = 1) => 'rgb(255,255,255)',
                        labelColor: () => colors.text,
                        propsForBackgroundLines: {
                            stroke: colors.borderColor
                        },
                        style: {
                            borderRadius: 0,
                            paddingLeft: 0,
                        },
                        propsForDots: {
                            r: "0",
                            strokeWidth: "2",
                        },
                    }}
                    decorator={() => {
                        return tooltipPos.visible ? <View>
                            <Svg>
                                <Rect x={tooltipPos.x - 18} 
                                    y={tooltipPos.y + 13} 
                                    width="55" 
                                    height="25"
                                    strokeWidth={1}
                                    stroke={COLORS.primary}
                                    rx={4}
                                    fill={colors.cardbackground} />
                                    <TextSVG
                                        x={tooltipPos.x + 5}
                                        y={tooltipPos.y + 30}
                                        fill={colors.title}
                                        fontSize="14"
                                        fontWeight="bold"
                                        textAnchor="middle">
                                        {tooltipPos.value}
                                    </TextSVG>
                                    <TextSVG
                                        x={tooltipPos.x + 25}
                                        y={tooltipPos.y + 30}
                                        fill={colors.title}
                                        fontSize="14"
                                        fontWeight="bold"
                                        textAnchor="middle">
                                        K
                                    </TextSVG>
                            </Svg>
                        </View> : null
                    }}

                    onDataPointClick={(data) => {

                        let isSamePoint = (tooltipPos.x === data.x 
                                            && tooltipPos.y === data.y)

                        isSamePoint ? setTooltipPos((previousState) => {
                            return { 
                                        ...previousState,
                                        value: data.value,
                                        visible: !previousState.visible
                                    }
                        })
                            : 
                        setTooltipPos({ x: data.x, value: data.value, y: data.y, visible: true });

                    }}

                />

            </View>
            <View style={{flexDirection:'row'}}>
                {
                    chartTab.map((e, index ) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setChartStatusFilter(e.status)}
                            style={[
                                styles.tabBtn,
                                {
                                backgroundColor:'rgba(255,255,255,.1)'},
                                status === e.status && styles.btnTabActive,
                            ]}
                        >
                            <Text style={[
                                {color:COLORS.white,
                                ...FONTS.font},
                                status === e.status && styles.btnTabActiveText
                            ]}
                            >{e.status}</Text>
                        </TouchableOpacity>
                    ))
                }
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}>
                    <SuccessModal
                        message={modalMessage}
                        isSuccess={isSuccess}
                        onClose={() => setModalVisible(false)}
                    />
                </View>
            </Modal>
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