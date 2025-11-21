import React, {useEffect, useState} from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS, FONTS, ICONS, IMAGES } from '../constants/theme';
import ThemeBtn from '../components/ThemeBtn';
import {getSession} from "@/app/helpers/sessionHelper";

function Sidebar({ navigation }) {

    // const navigation = useNavigation();
    const {colors} = useTheme();
    const [userSession, setUserSession] = useState(null);

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
                backgroundColor:colors.card,
            }}
        >
            <View
                style={{
                    paddingHorizontal:15,
                    paddingVertical:20,  
                    alignItems:'flex-start',
                    backgroundColor:COLORS.secondary,
                }}
            >
                <View
                    style={{
                        flexDirection:'row',
                        justifyContent:'space-between',
                        width:'100%',
                        marginBottom: 10
                    }}
                >
                    <View style={{marginRight:18,borderWidth:3,borderRadius:80,borderColor:'rgba(255,255,255,.1)', padding: 10}}>
                        <Image
                            source={IMAGES.logoIcon}
                            style={{
                                height:70,
                                width:70,
                                borderRadius:70,
                            }}
                        />
                    </View>
                    <View style={{marginTop:5}}>
                        <ThemeBtn/>
                    </View>
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

            </View>
            <View style={{flex:1,paddingVertical:15}}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('BottomNavigation', { screen: 'Home' })}
                >
                    <Image
                        source={ICONS.home}
                        style={{
                            height:18,
                            width:18,
                            tintColor:colors.text,
                            marginRight:12,
                        }}
                    />
                    <Text style={{...FONTS.font,...FONTS.fontMedium,color:colors.title,flex:1}}>Home</Text>
                    <FeatherIcon size={16} color={colors.text} name={'chevron-right'}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('BottomNavigation', { screen: 'Bet' })}
                >
                    <Image
                        source={ICONS.peso}
                        style={{
                            height:18,
                            width:18,
                            tintColor:colors.text,
                            marginRight:12,
                        }}
                    />
                    <Text style={{...FONTS.font,...FONTS.fontMedium,color:colors.title,flex:1}}>Bet</Text>
                    <FeatherIcon size={16} color={colors.text} name={'chevron-right'}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('account')}
                >
                    <Image
                        source={ICONS.verified}
                        style={{
                            height:18,
                            width:18,
                            tintColor:colors.text,
                            marginRight:12,
                        }}
                    />
                    <Text style={{...FONTS.font,...FONTS.fontMedium,color:colors.title,flex:1}}>Account</Text>
                    <FeatherIcon size={16} color={colors.text} name={'chevron-right'}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('printerScreen')}
                >
                    <Image
                        source={ICONS.qr}
                        style={{
                            height:18,
                            width:18,
                            tintColor:colors.text,
                            marginRight:12,
                        }}
                    />
                    <Text style={{...FONTS.font,...FONTS.fontMedium,color:colors.title,flex:1}}>Printer</Text>
                    <FeatherIcon size={16} color={colors.text} name={'chevron-right'}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('signin')}
                >
                    <Image
                        source={ICONS.logout}
                        style={{
                            height:18,
                            width:18,
                            tintColor:colors.text,
                            marginRight:12,
                        }}
                    />
                    <Text style={{...FONTS.font,...FONTS.fontMedium,color:colors.title,flex:1}}>Logout</Text>
                    <FeatherIcon size={16} color={colors.text} name={'chevron-right'}/>
                </TouchableOpacity>
            </View>
            <View
                style={{
                    paddingHorizontal:15,
                    paddingVertical:20,
                }}
            >
                <Text style={{...FONTS.h6,color:colors.title,marginBottom:5}}>E-Bet</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    navItem : {
        paddingHorizontal:15,
        paddingVertical:12,
        flexDirection:'row',
        alignItems:'center',
    }
})

export default Sidebar;