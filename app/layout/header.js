import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useNavigation, useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { FONTS } from '../constants/theme';
import { GlobalStyleSheet } from '../constants/styleSheet';

const HeaderBar = ({title,leftIcon}) => {
    const {colors} = useTheme();
    const navigation = useNavigation();
    return (
        <View
            style={{
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 4,
                },
                shadowOpacity: .08,
                shadowRadius: 10,
                zIndex:1,
                backgroundColor:colors.card,
            }}
        >
            <View
                style={[GlobalStyleSheet.container,{
                    padding:0,
                    height:48,
                    backgroundColor: colors.card,
                    flexDirection:'row',
                    alignItems:'center',
                }]}
            >
                <View
                    style={{
                        height:48,
                        width:48,
                    }}
                >
                    {leftIcon == "back" &&
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{
                                height:'100%',
                                width:'100%',
                                alignItems:'center',
                                justifyContent:'center',
                            }}
                        >
                            <FeatherIcon name='arrow-left' size={22} color={colors.title}/>
                        </TouchableOpacity>
                    }
                </View>
                <Text style={{flex:1,textAlign:'center',...FONTS.h6,...FONTS.fontMedium,color:colors.title}}>{title}</Text>
                <View
                    style={{
                        height:48,
                        width:48,
                    }}
                >

                </View>
            </View>
        </View>
    )
}

export default HeaderBar;