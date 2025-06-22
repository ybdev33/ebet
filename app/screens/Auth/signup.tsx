import React, {useEffect, useRef, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image, Modal,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {useTheme} from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {FONTS, SIZES, COLORS, ICONS, IMAGES} from '../../constants/theme';
import CustomButton from '../../components/customButton';
import {GlobalStyleSheet} from '../../constants/styleSheet';
import {LinearGradient} from 'expo-linear-gradient';
import SuccessModal from "@/app/components/modal/SuccessModal";

interface SignInProps {
    navigation: {
        navigate: (screen: string) => void;
    };
}

const SignUp: React.FC<SignInProps> = ({navigation}) => {
    const theme = useTheme();
    const {colors} = useTheme();

    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [referralCode, setReferralCode] = useState('');

    const nameRef = useRef<TextInput>(null);
    const usernameRef = useRef<TextInput>(null);
    const mobileNumberRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const referralCodeRef = useRef<TextInput>(null);

    const [handlePassword, setHandlePassword] = useState<boolean>(true);

    const [focusName, setFocusName] = useState(false);
    const [focusUsername, setFocusUsername] = useState(false);
    const [focusMobileNumber, setFocusMobileNumber] = useState(false);
    const [focusPassword, setFocusPassword] = useState(false);
    const [focusReferralCode, setFocusReferralCode] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSignUp = async () => {
        try {
            let body = JSON.stringify({
                "completeName": name,
                username,
                mobileNumber,
                password,
                referralCode,
                position: "gold"
            });

            const response = await fetch('http://64.20.36.34:9580/api/ApplicationUsers/CreateUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Authorization: 'Settings a2luZ3MzOiF0ZXJ5U3dldGk=',
                },
                body: body
            });

            console.log("body", body);
            console.log("response", response);
            const result = await response.json();
            console.log("result", result);
            if (response.ok) {
                setModalMessage('You are now logged in.');
                setIsSuccess(true);
                setModalVisible(true);
                navigation.navigate('drawernavigation');
                setModalVisible(false);
            } else {
                setModalMessage(result.message || 'Unable to log in.');
                setIsSuccess(false);
                setModalVisible(true);
            }
        } catch (error) {
            setModalMessage('Something went wrong. Please try again later.');
            setIsSuccess(false);
            setModalVisible(true);
        }
    };

    useEffect(() => {
        nameRef.current?.focus();
    }, []);

    return (
        <View style={[GlobalStyleSheet.container, {padding: 0, backgroundColor: COLORS.secondary, flex: 1}]}>
            <View
                style={{
                    height: 140,
                    backgroundColor: COLORS.secondary,
                    position: 'absolute',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Image
                    source={IMAGES.logoFullWhite}
                    style={{
                        width: 180,
                        resizeMode: 'contain',
                        marginBottom: 20,
                    }}
                />
            </View>

            <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}}>
                <Animatable.View animation="fadeInUpBig" duration={1000} style={{paddingTop: 140, flex: 1}}>
                    {!theme.dark && (
                        <View
                            style={{
                                height: 30,
                                backgroundColor: 'rgba(255,255,255,.2)',
                                left: 20,
                                right: 20,
                                position: 'absolute',
                                top: 114,
                                borderRadius: 40,
                            }}
                        />
                    )}
                    <View
                        style={{
                            ...styles.container,
                            backgroundColor: colors.background,
                            position: 'relative',
                        }}
                    >
                        {theme.dark && (
                            <LinearGradient
                                colors={["rgba(22,23,36,.7)", "rgba(22,23,36,0)"]}
                                style={{
                                    position: 'absolute',
                                    height: '100%',
                                    width: '100%',
                                }}
                            />
                        )}
                        <View style={{paddingHorizontal: SIZES.padding, paddingTop: 20, flex: 1}}>
                            <View style={{alignItems: 'center', paddingTop: 15, marginBottom: 30}}>
                                <Animatable.Text
                                    animation="fadeInUp"
                                    duration={1000}
                                    delay={700}
                                    style={{...FONTS.h3, color: colors.text}}
                                >
                                    Create Account
                                </Animatable.Text>
                                <Animatable.Text
                                    animation="fadeInUp"
                                    duration={1000}
                                    delay={700}
                                    style={{...FONTS.font, color: colors.text}}
                                >
                                    Enter your details below
                                </Animatable.Text>
                            </View>
                            <Animatable.View
                                animation="fadeInUp"
                                duration={1000}
                                delay={800}
                                style={styles.inputGroup}
                            >
                                <Text
                                    style={{...FONTS.fontSm, color: colors.text, marginBottom: 6}}>Name</Text>
                                <View
                                    style={{
                                        ...GlobalStyleSheet.shadow,
                                        backgroundColor: colors.card,
                                        borderRadius: SIZES.radius,
                                    }}
                                >
                                    <View style={styles.inputIco}>
                                        <FeatherIcon name="stop-circle" color={COLORS.primary} size={18}/>
                                    </View>
                                    <TextInput
                                        ref={nameRef}
                                        onFocus={() => setFocusName(true)}
                                        onBlur={() => setFocusName(false)}
                                        onChangeText={setName}
                                        style={[
                                            styles.input,
                                            {
                                                color: colors.text,
                                                backgroundColor: colors.card,
                                            },
                                            focusName ? styles.inputActive : undefined,
                                        ]}
                                        placeholderTextColor={colors.text}
                                        placeholder="Enter your name"
                                    />
                                </View>
                            </Animatable.View>
                            <Animatable.View
                                animation="fadeInUp"
                                duration={1000}
                                delay={800}
                                style={styles.inputGroup}
                            >
                                <Text
                                    style={{...FONTS.fontSm, color: colors.text, marginBottom: 6}}>Username</Text>
                                <View
                                    style={{
                                        ...GlobalStyleSheet.shadow,
                                        backgroundColor: colors.card,
                                        borderRadius: SIZES.radius,
                                    }}
                                >
                                    <View style={styles.inputIco}>
                                        <FeatherIcon name="user" color={COLORS.primary} size={18}/>
                                    </View>
                                    <TextInput
                                        ref={usernameRef}
                                        onFocus={() => setFocusUsername(true)}
                                        onBlur={() => setFocusUsername(false)}
                                        onChangeText={setUsername}
                                        style={[
                                            styles.input,
                                            {
                                                color: colors.text,
                                                backgroundColor: colors.card,
                                            },
                                            focusUsername ? styles.inputActive : undefined,
                                        ]}
                                        placeholderTextColor={colors.text}
                                        placeholder="Enter your username"
                                        autoCapitalize="none"
                                        keyboardType="default"
                                    />
                                </View>
                            </Animatable.View>
                            <Animatable.View
                                animation="fadeInUp"
                                duration={1000}
                                delay={900}
                                style={styles.inputGroup}
                            >
                                <Text style={{...FONTS.fontSm, color: colors.text, marginBottom: 6}}>Mobile Number</Text>
                                <View
                                    style={{
                                        ...GlobalStyleSheet.shadow,
                                        backgroundColor: colors.card,
                                        borderRadius: SIZES.radius,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                >
                                    <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10}}>
                                        <Text style={{marginLeft: 5, color: COLORS.primary}}>+63</Text>
                                    </View>
                                    <TextInput
                                        ref={mobileNumberRef}
                                        onFocus={() => setFocusMobileNumber(true)}
                                        onBlur={() => setFocusMobileNumber(false)}
                                        onChangeText={(text) => {
                                            if (text.startsWith('0')) {
                                                text = text.slice(1);
                                                mobileNumberRef.current?.setNativeProps({ text: text });
                                            }
                                            setMobileNumber(text);
                                        }}
                                        style={[
                                            styles.input,
                                            {
                                                color: colors.text,
                                                backgroundColor: colors.card,
                                                paddingLeft: 10,
                                            },
                                            focusMobileNumber ? styles.inputActive : undefined,
                                        ]}
                                        placeholderTextColor={colors.text}
                                        placeholder="Enter your mobile number"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </Animatable.View>
                            <Animatable.View
                                animation="fadeInUp"
                                duration={1000}
                                delay={1200}
                                style={styles.inputGroup}
                            >
                                <Text style={{...FONTS.fontSm, color: colors.text, marginBottom: 6}}>Password</Text>
                                <View
                                    style={{
                                        ...GlobalStyleSheet.shadow,
                                        backgroundColor: colors.card,
                                        borderRadius: SIZES.radius,
                                    }}
                                >
                                    <View style={styles.inputIco}>
                                        <FeatherIcon name="lock" color={COLORS.primary} size={18}/>
                                    </View>
                                    <TextInput
                                        ref={passwordRef}
                                        onFocus={() => setFocusPassword(true)}
                                        onBlur={() => setFocusPassword(false)}
                                        onChangeText={setPassword}
                                        style={[
                                            styles.input,
                                            {
                                                color: colors.text,
                                                backgroundColor: colors.card,
                                            },
                                            focusPassword ? styles.inputActive : undefined,
                                        ]}
                                        placeholderTextColor={colors.text}
                                        placeholder="Create password"
                                        secureTextEntry={handlePassword}
                                    />
                                    {handlePassword ? (
                                        <TouchableOpacity
                                            style={styles.eyeIcon}
                                            onPress={() => setHandlePassword(false)}
                                        >
                                            <FeatherIcon name="eye" color={COLORS.primary} size={18}/>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.eyeIcon}
                                            onPress={() => setHandlePassword(true)}
                                        >
                                            <FeatherIcon name="eye-off" color={COLORS.primary} size={18}/>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </Animatable.View>
                            <Animatable.View
                                animation="fadeInUp"
                                duration={1000}
                                delay={1500}
                                style={styles.inputGroup}
                            >
                                <Text
                                    style={{...FONTS.fontSm, color: colors.text, marginBottom: 6}}>Referral Code (optional)</Text>
                                <View
                                    style={{
                                        ...GlobalStyleSheet.shadow,
                                        backgroundColor: colors.card,
                                        borderRadius: SIZES.radius,
                                    }}
                                >
                                    <View style={styles.inputIco}>
                                        <FeatherIcon name="link" color={COLORS.primary} size={18}/>
                                    </View>
                                    <TextInput
                                        ref={referralCodeRef}
                                        onFocus={() => setFocusReferralCode(true)}
                                        onBlur={() => setFocusReferralCode(false)}
                                        onChangeText={setReferralCode}
                                        style={[
                                            styles.input,
                                            {
                                                color: colors.text,
                                                backgroundColor: colors.card,
                                            },
                                            focusReferralCode ? styles.inputActive : undefined,
                                        ]}
                                        placeholderTextColor={colors.text}
                                        placeholder="Enter your referral code"
                                    />
                                </View>
                            </Animatable.View>
                            <Animatable.View animation="fadeInUp" duration={1000} delay={1500}>
                                <CustomButton onPress={handleSignUp} title="Create"/>
                            </Animatable.View>
                            <View style={{flexDirection: 'row', justifyContent: 'center', marginVertical: 15}}>
                                <Text
                                    style={{
                                        ...FONTS.font,
                                        marginRight: 5,
                                        color: colors.text,
                                    }}
                                >
                                    Already have an account?
                                </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('signin')}>
                                    <Text style={{...FONTS.font, color: COLORS.primary}}>Sign in</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Animatable.View>
            </ScrollView>

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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderTopLeftRadius: SIZES.radius_lg,
        borderTopRightRadius: SIZES.radius_lg,
        overflow: 'hidden',
        marginTop: -16,
    },
    inputGroup: {
        position: 'relative',
        marginBottom: 15,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: 'transparent',
        fontSize: SIZES.font,
        borderRadius: SIZES.radius,
        paddingLeft: 50,
        flex: 1,
    },
    inputActive: {
        borderColor: COLORS.primary,
    },
    inputIco: {
        position: 'absolute',
        left: 17,
        top: 15,
        tintColor: COLORS.primary,
        height: 18,
        width: 18,
        resizeMode: 'contain',
        zIndex: 1,
    },
    eyeIcon: {
        position: 'absolute',
        right: 0,
        top: 0,
        height: 48,
        width: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default SignUp;
