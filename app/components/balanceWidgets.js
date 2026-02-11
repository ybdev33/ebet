import React , {useRef, useEffect, useMemo} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Animated,
    Dimensions,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Ripple from 'react-native-material-ripple';

import { FONTS, SIZES, COLORS, ICONS } from '../constants/theme';
import { GlobalStyleSheet } from '../constants/styleSheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BalanceWidgets = ({dashData}) => {

    const {colors} = useTheme();
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
            },
            {
                id: "2",
                pic: ICONS.trophy,
                title: "Total Hits",
                balance: `${dashData.totalHits}`,
                status: "hits",
            },
        ];
    }, [dashData]);

    // Each card takes 50% of the screen width minus margin
    const cardWidth = (SCREEN_WIDTH - 70) / 2; // 10px padding each side + 10px gap

    return(
        <View style={{ flexDirection: 'row', paddingHorizontal: 10, paddingTop: 20 }}>
            {cardData.map((item) => (
                <Ripple
                    key={item.id}
                    style={[
                        {
                            width: cardWidth,
                            borderRadius:12,
                            backgroundColor: colors.card,
                            ...GlobalStyleSheet.shadow,
                            paddingHorizontal:15,
                            paddingVertical:18,
                            marginBottom: 10,
                            marginRight: 18,
                        }
                    ]}
                >
                    <View style={[styles.cardIco,{backgroundColor:colors.background,borderWidth:1,borderColor:colors.borderColor}]}>
                        <Image style={{
                            width:18,
                            height:18,
                            tintColor: item.status === "total" ? COLORS.warning :
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
                </Ripple>
            ))}
        </View>
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
})

export default BalanceWidgets;