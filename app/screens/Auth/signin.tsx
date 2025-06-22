import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
    Image,
    Modal
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { useTheme, NavigationProp } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { FONTS, SIZES, COLORS, IMAGES } from '../../constants/theme';
import CustomButton from '../../components/customButton';
import { GlobalStyleSheet } from '../../constants/styleSheet';
import { LinearGradient } from 'expo-linear-gradient';
import SuccessModal from '../../components/modal/SuccessModal';
import { saveSession, getSession, removeSession } from '../../helpers/sessionHelper';

interface SignInProps {
    navigation: NavigationProp<any>;
}

const SignIn: React.FC<SignInProps> = ({ navigation }) => {
    const theme = useTheme();
    const { colors } = theme;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [handlePassword, setHandlePassword] = useState<boolean>(true);
    const [toggleCheckBox, setToggleCheckBox] = useState<boolean>(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const usernameRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);

    const [focusUsername, setFocusUsername] = useState<boolean>(false);
    const [focusPassword, setFocusPassword] = useState<boolean>(false);

    const handleSignIn = async () => {
        try {
            const response = await fetch('http://64.20.36.34:9580/api/ApplicationUsers/GetUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Authorization: 'Settings a2luZ3MzOiF0ZXJ5U3dldGk=',
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                await saveSession('userSession', result);

                if (toggleCheckBox) {
                    await saveSession('rememberedUser', { username, password });
                } else {
                    await removeSession('rememberedUser');
                }

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
        usernameRef.current?.focus();

        const loadRememberedCredentials = async () => {
            try {
                const savedCredentials = await getSession('rememberedUser');
                if (savedCredentials && typeof savedCredentials === 'object') {
                    setUsername(savedCredentials.username || '');
                    setPassword(savedCredentials.password || '');
                    setToggleCheckBox(true); // Sync state with session
                } else {
                    setUsername('');
                    setPassword('');
                    setToggleCheckBox(false); // Ensure checkbox is unchecked if no data
                }
            } catch (error) {
                console.error('Error loading remembered credentials:', error);
            }
        };

        loadRememberedCredentials().catch((error) =>
            console.error('Unhandled promise rejection:', error)
        );
    }, []);

    return (
        <View style={[GlobalStyleSheet.container, { padding: 0, backgroundColor: COLORS.secondary, flex: 1 }]}>
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
            <ScrollView showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                <Animatable.View animation="fadeInUpBig" duration={1000} style={{ paddingTop: 140, flex: 1 }}>
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
                                colors={['rgba(22,23,36,.7)', 'rgba(22,23,36,0)']}
                                style={{
                                    position: 'absolute',
                                    height: '100%',
                                    width: '100%',
                                }}
                            />
                        )}
                        <View style={{ paddingHorizontal: SIZES.padding, paddingTop: 20, flex: 1 }}>
                            <View style={{ alignItems: 'center', paddingTop: 15, marginBottom: 30 }}>
                                <Animatable.Text
                                    animation="fadeInUp"
                                    duration={1000}
                                    delay={700}
                                    style={{ ...FONTS.h3, color: colors.text }}
                                >
                                    Sign in your account
                                </Animatable.Text>
                                <Animatable.Text
                                    animation="fadeInUp"
                                    duration={1000}
                                    delay={700}
                                    style={{ ...FONTS.font, color: colors.text }}
                                >
                                    Enter your details below
                                </Animatable.Text>
                            </View>
                            <Animatable.View
                                animation="fadeInUp"
                                duration={1000}
                                delay={1000}
                                style={[styles.inputGroup]}
                            >
                                <Text style={{ ...FONTS.fontSm, color: colors.text, marginBottom: 6 }}>Username</Text>
                                <View
                                    style={{
                                        ...GlobalStyleSheet.shadow,
                                        backgroundColor: colors.card,
                                        borderRadius: SIZES.radius,
                                    }}
                                >
                                    <View style={styles.inputIco}>
                                        <FeatherIcon name="user" color={COLORS.primary} size={18} />
                                    </View>
                                    <TextInput
                                        ref={usernameRef}
                                        onFocus={() => setFocusUsername(true)}
                                        onBlur={() => setFocusUsername(false)}
                                        style={[
                                            styles.input,
                                            { color: colors.text, backgroundColor: colors.card },
                                            focusUsername ? styles.inputActive : null,
                                        ]}
                                        placeholderTextColor={colors.text}
                                        placeholder="Enter your username"
                                        value={username}
                                        onChangeText={setUsername}
                                        autoCapitalize="none"
                                        keyboardType="default"
                                        onSubmitEditing={() => passwordRef.current?.focus()}
                                    />
                                </View>
                            </Animatable.View>
                            <Animatable.View
                                animation="fadeInUp"
                                duration={1000}
                                delay={1200}
                                style={styles.inputGroup}
                            >
                                <Text style={{ ...FONTS.fontSm, color: colors.text, marginBottom: 6 }}>Password</Text>
                                <View
                                    style={{
                                        ...GlobalStyleSheet.shadow,
                                        backgroundColor: colors.card,
                                        borderRadius: SIZES.radius,
                                    }}
                                >
                                    <View style={styles.inputIco}>
                                        <FeatherIcon name="lock" color={COLORS.primary} size={18} />
                                    </View>
                                    <TextInput
                                        ref={passwordRef}
                                        onFocus={() => setFocusPassword(true)}
                                        onBlur={() => setFocusPassword(false)}
                                        style={[
                                            styles.input,
                                            { color: colors.text, backgroundColor: colors.card },
                                            focusPassword ? styles.inputActive : null,
                                        ]}
                                        placeholderTextColor={colors.text}
                                        placeholder="Enter password"
                                        secureTextEntry={handlePassword}
                                        value={password}
                                        onChangeText={setPassword}
                                        returnKeyType="done"
                                        onSubmitEditing={handleSignIn}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeIcon}
                                        onPress={() => setHandlePassword(!handlePassword)}
                                    >
                                        <FeatherIcon
                                            name={handlePassword ? 'eye' : 'eye-off'}
                                            color={COLORS.primary}
                                            size={18}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </Animatable.View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <Animatable.View
                                    animation="fadeInLeft"
                                    duration={1000}
                                    delay={1200}
                                    style={{ flexDirection: 'row', alignItems: 'center' }}
                                >
                                    <View
                                        style={[
                                            Platform.OS === 'ios' && {
                                                transform: [{ scale: 0.8 }],
                                                marginRight: 5,
                                            },
                                        ]}
                                    >
                                        <Checkbox
                                            status={toggleCheckBox ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                setToggleCheckBox(!toggleCheckBox);
                                            }}
                                            color={COLORS.primary}
                                        />
                                    </View>
                                    <Text style={{ ...FONTS.font, color: colors.text }}>Remember Me</Text>
                                </Animatable.View>
                                <Animatable.View animation="fadeInRight" duration={1000} delay={1200}>
                                    <TouchableOpacity onPress={() => navigation.navigate('emailverify')}>
                                        <Text style={{ ...FONTS.font, color: COLORS.primary }}>Forgot Password</Text>
                                    </TouchableOpacity>
                                </Animatable.View>
                            </View>
                            <Animatable.View animation="fadeInUp" duration={1000} delay={1200}>
                                <CustomButton onPress={handleSignIn} title="Sign In" />
                            </Animatable.View>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 15 }}>
                                <Text
                                    style={{
                                        ...FONTS.font,
                                        marginRight: 5,
                                        color: colors.text,
                                    }}
                                >
                                    Don't have an account?
                                </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('register')}>
                                    <Text style={{ ...FONTS.font, color: COLORS.primary }}>Sign up</Text>
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

export default SignIn;
