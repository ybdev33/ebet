import React, {useEffect, useState} from 'react'
import { 
    View, 
    Text ,
    ScrollView,
    ImageBackground,
    Image,
    TouchableOpacity,
    PermissionsAndroid,
    Platform,
} from 'react-native'
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import HeaderBar from '../layout/header';
import { COLORS, FONTS, ICONS, IMAGES, SIZES } from '../constants/theme';
import { launchImageLibrary } from 'react-native-image-picker';
import { GlobalStyleSheet } from '../constants/styleSheet';
import {getSession} from "../helpers/sessionHelper";

const Profile = ({navigation}) => {

    const {colors} = useTheme();
    const [imgUrl , setImgUrl] = useState(null);
    const [userSession, setUserSession] = useState(null);

    const navLinks = [
        {
            icon : ICONS.verified,
            title : "Account",
            navigate : "account",
        },
        {
            icon : ICONS.link,
            title : "Referral",
            navigate : "referral",
        },
        {
            icon : ICONS.customer,
            title : "Users",
            navigate : "users",
        },
        {
            icon : ICONS.qr,
            title : "Printer",
            navigate : "printerScreen",
        },
        {
            icon : ICONS.logout,
            title : "Logout",
            navigate : "signin",
        },
    ]

    useEffect(() => {
        (async () => {
            try {
                const user = await getSession('userSession');
                setUserSession(user);
            } catch (error) {
                console.error('Failed to load user session', error);
            }
        })();
    }, []);

    return (
        <View
            style={{
                flex:1,
                backgroundColor:colors.background,
            }}
        >
            <HeaderBar
                leftIcon={'back'}
                title={"Profile"}
            />
            <ScrollView
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom:100,
                }}
            >
                <View
                    style={[GlobalStyleSheet.container,{
                        padding:15,
                    }]}
                >
                    <ImageBackground
                        source={IMAGES.bg1}
                        style={{
                            flexDirection:'row',
                            paddingHorizontal:18,
                            paddingVertical:18,
                            borderRadius:SIZES.radius_lg,
                            overflow:'hidden',
                            alignItems:'center',
                        }}
                    >
                        <View style={{marginRight:18,borderWidth:3,borderRadius:80,borderColor:'rgba(255,255,255,.1)', padding: 10}}>
                            <Image
                                source={imgUrl ? {uri : imgUrl} : IMAGES.logoIcon}
                                style={{
                                    height:70,
                                    width:70,
                                    borderRadius:70,
                                }}
                            />
                            <TouchableOpacity
                                activeOpacity={.9}
                                style={{
                                    height:28,
                                    width:28,
                                    position:'absolute',
                                    backgroundColor:COLORS.primary,
                                    borderRadius:28,
                                    bottom:0,
                                    right:0,
                                    alignItems:'center',
                                    justifyContent:'center',
                                }}
                            >
                                <FeatherIcon size={14} color={COLORS.white} name='user'/>
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Text style={{...FONTS.h6,color:COLORS.white,marginBottom:7}}>{userSession?.data?.completeName || "Loading..."}</Text>
                            <View
                                style={{
                                    flexDirection:'row',
                                    alignItems:'center',
                                }}
                            >
                                <FeatherIcon style={{marginRight:6}} color={colors.text} size={14} name='phone' />
                                <Text style={{...FONTS.fontSm,color:COLORS.white,opacity:.6}}>+63 {userSession?.data?.mobileNumber?.replace(/^0+/, '') || "N/A"}</Text>
                            </View>
                        </View>
                    </ImageBackground>
                    <View
                        style={{
                            paddingHorizontal:18,
                            paddingVertical:15,
                            borderRadius:SIZES.radius_lg,
                            backgroundColor:colors.card,
                            marginTop:15,
                            ...GlobalStyleSheet.shadow,
                        }}
                    >
                        {navLinks.map((data,index) => {
                            return(
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => navigation.navigate(data.navigate)}
                                    style={{
                                        flexDirection:'row',
                                        alignItems:'center',
                                        paddingVertical:16,
                                    }}
                                >
                                    <Image
                                        style={[{
                                            height:20,
                                            width:20,
                                            tintColor:colors.text,
                                            marginRight:14,
                                        }]}
                                        source={data.icon}
                                    />
                                    <Text style={{...FONTS.font,flex:1,...FONTS.fontMedium,color:colors.title}}>{data.title}</Text>
                                    <FeatherIcon size={18} color={colors.text} name='chevron-right'/>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </View>
            </ScrollView>
        </View>
  )
}

export default Profile