import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { COLORS, FONTS, ICONS, SIZES } from '../constants/theme';
import { GlobalStyleSheet } from '../constants/styleSheet';

const CustomTabBar = ({state,navigation,descriptors}) => {
    
    const {colors} = useTheme();

    return (
        <>
            <View
                style={{
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 0,
                    },
                    shadowOpacity: .15,
                    shadowRadius: 10,
                    position:'absolute',
                    bottom: 0,
                    left:0,
                    right:0,
                    backgroundColor:colors.card,
                    borderRadius:SIZES.radius,
                }}
            >
                <View
                    style={[GlobalStyleSheet.container,{
                        padding:0,
                        height:60,
                        backgroundColor:colors.card,
                        flexDirection:'row',
                        zIndex:3,
                    }]}
                >
                    {state.routes.map((route, index) => {

                        const { options } = descriptors[route.key];
                        const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                            ? options.title
                            : route.name;

                        const isFocused = state.index === index;
                        
                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate({ name: route.name, merge: true });
                            }

                        }
                        if(label == "Bet"){
                            return(
                                <View style={[styles.tabItem,{paddingHorizontal:10}]} key={index}>
                                    <TouchableOpacity
                                        activeOpacity={.9}
                                        onPress={onPress}
                                        style={{
                                            height:60,
                                            width:60,
                                            backgroundColor:COLORS.primary,
                                            borderRadius:15,
                                            marginTop:-48,
                                            alignItems:'center',
                                            justifyContent:'center',
                                        }}
                                    >
                                        <Image
                                            source={ICONS.bet}
                                            style={{
                                                height:48,
                                                width:48,
                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )
                        }else{
                            return(
                                <View style={styles.tabItem} key={index}>
                                    <TouchableOpacity
                                        style={styles.tabLink}
                                        onPress={onPress}
                                    >
                                        <Image
                                            source={
                                                label === "Home" ? ICONS.home :
                                                label === "Wallet" ? ICONS.wallet :
                                                    label === "History" ? ICONS.history :
                                                label === "Profile" ? ICONS.profile : null
                                            }
                                            style={{
                                                height:18,
                                                width:18,
                                                marginBottom:6,
                                                marginTop:1,
                                                tintColor:colors.title,
                                                opacity:isFocused ? 1 : .45,
                                            }}
                                        />
                                        <Text style={{...FONTS.fontSm,color:colors.title,opacity: isFocused ? 1 : .45}}>{label}</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                    })}
                </View>
            </View>
        </>
    );
};



const styles = StyleSheet.create({
    tabLink:{
        alignItems:'center',
    },
    tabItem:{
        flex:1,
        alignItems:'center',
        justifyContent:'center',
    },
    navText:{
        ...FONTS.fontSm,
    }
})


export default CustomTabBar;