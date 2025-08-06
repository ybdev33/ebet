import React , {useRef, useEffect, useMemo} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    Animated,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { LineChart } from "react-native-chart-kit";
import Ripple from 'react-native-material-ripple';

import { FONTS, SIZES, COLORS, ICONS } from '../constants/theme';
import { GlobalStyleSheet } from '../constants/styleSheet';

const BalanceWidgets = ({dashData}) => {

    const {colors} = useTheme();
    const navigation = useNavigation();
    const chartWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        setTimeout(() => {
            Animated.timing(chartWidth, {
                toValue: 190,
                duration: 7000,
                useNativeDriver:false,
            }).start();
        }, 1000);

    }, [dashData]);

    const cardData = useMemo(() => {
        if (!dashData || Object.keys(dashData).length === 0) return [];

        return [
            {
                id: "1",
                pic: ICONS.badge,
                title: "Total Bets",
                balance: `${dashData.totalBets}`,
                status: "total",
                navigate: 'Wallet'
            },
            {
                id: "2",
                pic: ICONS.trophy,
                title: "Total Hits",
                balance: `${dashData.totalHits}`,
                status: "hits",
                navigate: 'hits'
            },
            {
                id: "3",
                pic: ICONS.pesocom,
                title: "Total Commission",
                balance: `${dashData.totalCommision}`,
                status: "commission",
                navigate: 'commissions'
            },
            {
                id: "4",
                pic: ICONS.cancelled,
                title: "Total Cancelled",
                balance: `${dashData.totalCancelled}`,
                status: "cancelled",
                navigate: 'cancelledBets'
            },
        ];
    }, [dashData]);

    return(
        <FlatList
            horizontal
            contentContainerStyle={{
                paddingLeft:15,
                paddingTop:20,
            }}
            showsHorizontalScrollIndicator={false}
            data={cardData}
            renderItem={({ item }) => (
                <Ripple
                    style={[{
                        width:140,
                        borderRadius:12,
                        position:'relative',
                        backgroundColor:colors.card,
                        ...GlobalStyleSheet.shadow,
                        marginBottom:30,
                        marginRight:12,
                    }]}
                >
                    <View style={{
                        paddingHorizontal:15,
                        paddingVertical:18,
                    }}>
                        <View style={[styles.cardIco,{backgroundColor:colors.background,borderWidth:1,borderColor:colors.borderColor}]}>
                            <Image style={{
                                width:18,
                                height:18,
                                tintColor:item.status === "total" ? COLORS.warning :
                                    item.status === "cancelled" ? COLORS.danger :
                                        item.status === "commission" ? COLORS.info :
                                            item.status === "hits" ? COLORS.success :
                                                COLORS.primary,
                            }} source={item.pic}/>
                        </View>
                        <Text style={{...FONTS.fontXs,marginBottom:6,color:colors.text}}>{item.title}</Text>
                        <Text
                            style={{
                                ...FONTS.h6,
                                marginBottom:4,
                                color:colors.title,
                            }}
                        >{item.balance}</Text>
                    </View>
                </Ripple>
            )}
            keyExtractor={(item) => item.id}
        />
    )
}

const styles = StyleSheet.create({
    cardIco:{
        height:42,
        width:42,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'rgba(255,255,255,.1)',
        borderRadius:SIZES.radius,
        marginBottom:15,
    },
    cardPattern:{
        position:'absolute',
        width:'100%',
        height:'100%',
        zIndex:-1,
        right:0,
        top:0,
        resizeMode:'cover',
    }
})

export default BalanceWidgets;