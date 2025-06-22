import React from 'react';
import { useTheme } from '@react-navigation/native';
import { Image, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { COLORS, ICONS, IMAGES } from '../constants/theme';
import themeContext from '../constants/themeContext';

const ThemeBtn = () => {

    const {colors} = useTheme();
    const theme = useTheme();
    
    const {setDarkTheme,setLightTheme} = React.useContext(themeContext);

    const offset = useSharedValue(0);
    const opacityDark = useSharedValue(0);
    const opacityLight = useSharedValue(0);

    const animatedStyles = useAnimatedStyle(() => {
        return {
          transform: [{ translateX: offset.value}],
        };
    });
   
    if(theme.dark){
        offset.value = withSpring(34);
        opacityDark.value = withTiming(1);
        opacityLight.value = withTiming(0);
    }else{
        offset.value = withSpring(0);
        opacityLight.value = withTiming(1);
        opacityDark.value = withTiming(0);
    }


    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
                if(theme.dark){
                    setLightTheme()
                }else{
                    setDarkTheme()
                }
            }
            }
            style={{
                height:34,
                width:68,
                borderRadius:17,
                flexDirection:'row',
                alignItems:'center',
                backgroundColor: 'rgba(255,255,255,.1)',
            }}
            >
            
            <Animated.View
                style={[animatedStyles,{
                height:28,
                width:28,
                borderRadius:14,
                backgroundColor:COLORS.primary,
                alignItems:'center',
                justifyContent:'center',
                position:'absolute',
                top:3,
                left:3,
                }]}
            ></Animated.View>
            <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                <Image
                    source={ICONS.sun}
                    style={{
                        height:18,
                        width:18,
                        tintColor: COLORS.white,
                    }}
                />
            </View>
            <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                <Image
                    source={ICONS.moon}
                    style={{
                        height:18,
                        width:18,
                        tintColor: COLORS.white,
                    }}
                />
            </View>
        </TouchableOpacity>
    );
};


export default ThemeBtn;