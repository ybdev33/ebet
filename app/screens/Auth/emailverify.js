import React, {useState} from 'react';

import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from 'react-native';

import * as Animatable from 'react-native-animatable';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { FONTS, SIZES, COLORS, IMAGES } from '../../constants/theme';
import CustomButton from '../../components/customButton';
import { Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalStyleSheet } from '../../constants/styleSheet';

const EmailVerify = ({navigation}) => {

    const theme = useTheme();
    const {colors} = useTheme();
    const [isFocused , setisFocused] = useState(false);


    return(
        <View style={[GlobalStyleSheet.container,{padding:0, backgroundColor:COLORS.secondary,flex:1}]}>
            <View style={{
                height:140,
                backgroundColor:COLORS.secondary,
                position:'absolute',
                width:'100%',
                alignItems:'center',
                justifyContent:'center',
            }}>

                <Image
                    source={IMAGES.logoFullWhite}
                    style={{
                        width:180,
                        resizeMode:'contain',
                        marginBottom:20,
                    }}
                />
            </View>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1}}
                showsHorizontalScrollIndicator={false}
            >
                <Animatable.View
                    animation="fadeInUpBig" 
                    duration={1000}
                    style={{paddingTop:140,flex:1}}> 
                    {!theme.dark &&
                        <View
                            style={{
                                height:30,
                                backgroundColor:'rgba(255,255,255,.2)',
                                left:20,
                                right:20,
                                position:'absolute',
                                top:114,
                                borderRadius:40,
                            }}
                        />
                    }
                    <View 
                        style={{
                            ...styles.container,
                            backgroundColor:colors.background,
                            position:'relative',
                        }}>
                        {theme.dark &&
                            <LinearGradient
                                colors={["rgba(22,23,36,.7)","rgba(22,23,36,0)"]}
                                style={{
                                position:'absolute',
                                height:'100%',
                                width:'100%',
                                }}
                            >
                            </LinearGradient>
                        }
                        <View style={{
                            paddingHorizontal:SIZES.padding,
                            paddingTop:20,
                            flex:1,
                        }}>
                            <View style={{alignItems:'center',paddingTop:15,marginBottom:30}}>
                                <Animatable.Text
                                    animation="fadeInUp" 
                                    duration={1000}
                                    delay={700}
                                    style={{...FONTS.h3,color:colors.title}}>Forgot password</Animatable.Text>
                                <Animatable.Text
                                    animation="fadeInUp" 
                                    duration={1000}
                                    delay={700}
                                    style={{...FONTS.font,color:colors.text}}>Enter your details below</Animatable.Text>
                            </View>
                            <View style={{flex:1}}>
                                <Animatable.View 
                                    animation="fadeInUp" 
                                    duration={1000}
                                    delay={1000}
                                    style={[styles.inputGroup]}>
                                    <Text style={{...FONTS.fontSm,color:colors.title,marginBottom:6}}>Email</Text>
                                    <View
                                        style={{
                                            ...GlobalStyleSheet.shadow,
                                            backgroundColor:colors.card,
                                            borderRadius:SIZES.radius,
                                            marginBottom:10,
                                        }}
                                    >
                                        <View style={styles.inputIco}>
                                            <FeatherIcon name='mail' color={COLORS.primary} size={18}/>
                                        </View>
                                        <TextInput 
                                            onFocus={() => setisFocused(true)}
                                            onBlur={() => setisFocused(false)}
                                            style={[
                                                styles.input,
                                                {color:colors.title,
                                                backgroundColor:colors.card},
                                                isFocused ? styles.inputActive : ""
                                            ]}
                                            placeholderTextColor={colors.text}
                                            placeholder='Enter your email'
                                        />
                                    </View>
                                </Animatable.View>
                                
                                <Animatable.View
                                    animation="fadeInUp" 
                                    duration={1000}
                                    delay={1500}
                                >
                                    <CustomButton 
                                        onPress={() => {navigation.navigate('changepassword')}}
                                        title="Continue"
                                    />
                                </Animatable.View>
                            </View>
                            <View style={{flexDirection:'row',justifyContent:'center',marginVertical:30}}>
                                <Text style={{
                                    ...FONTS.font,
                                    marginRight:5,
                                    color:colors.text,
                                }}>Back to</Text>
                                <TouchableOpacity onPress={()=> navigation.navigate('signin')}>
                                    <Text style={{...FONTS.font,color:COLORS.primary}}>Sign in</Text>
                                </TouchableOpacity>
                            </View>
                            
                        </View>
                    </View>
               
               </Animatable.View> 
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        borderTopLeftRadius:SIZES.radius_lg,
        borderTopRightRadius:SIZES.radius_lg,
        overflow:'hidden',
        marginTop:-16,
    },
    inputGroup:{
        position:'relative',
        marginBottom:15,
    },
    input:{
        height:48,
        borderWidth:1,
        borderColor:'transparent',
        fontSize:SIZES.font,
        borderRadius:SIZES.radius,
        paddingLeft:50,
    },
    inputActive:{
        borderColor:COLORS.primary,
    },
    inputGroupActive:{
        shadowColor: COLORS.primary,
        shadowOffset:{
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
    },
    inputIco:{
        position:'absolute',
        left:17,
        top:15,
        tintColor:COLORS.primary,
        height:18,
        width:18,
        resizeMode:'contain',
        zIndex:1,
    },
    seprator:{
        height:1,
        width:'100%',
        position:'absolute',
    },
    eyeIcon:{
        position:'absolute',
        right:0,
        top:0,
        height:48,
        width:48,
        alignItems:'center',
        justifyContent:'center',
    },
    eyeImg:{
        height:20,
        width:20,
    }
})

export default EmailVerify;