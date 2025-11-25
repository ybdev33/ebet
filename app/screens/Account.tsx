import React, {useEffect, useRef, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView, Modal, TouchableOpacity,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import FeatherIcon from 'react-native-vector-icons/Feather';

import { useTheme } from '@react-navigation/native';
import { FONTS, SIZES, COLORS } from '../constants/theme';
import HeaderBar from '../layout/header';
import { GlobalStyleSheet } from '../constants/styleSheet';
import CustomButton from '../components/customButton';
import SuccessModal from "../components/modal/SuccessModal";
import {getSession} from "../helpers/sessionHelper";
import Constants from "expo-constants";

const Account: React.FC = () => {
    const { GAMING_DOMAIN } = Constants.expoConfig?.extra || {};
    
    const { colors } = useTheme();
    const [focusField, setFocusField] = useState<string | null>(null);

    const [handlePassword, setHandlePassword] = useState<boolean>(true);

    let [name, setName] = useState('');
    let [username, setUsername] = useState('dev3');
    let [mobileNumber, setMobileNumber] = useState('');
    let [password, setPassword] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const user = await getSession('userSession');

                if (user) {
                    setName(user.data.completeName || '');
                    setUsername(user.data.username || '');
                    setMobileNumber(user.data.mobileNumber || '');
                }
            } catch (error) {
                console.error('Failed to load user session', error);
            }
        })();
    }, []);

    const nameRef = useRef<TextInput>(null);
    const usernameRef = useRef<TextInput>(null);
    const mobileNumberRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const referralCodeRef = useRef<TextInput>(null);

    const fields = [
        { label: 'Name', placeholder: 'Enter your name', value: name, icon: 'stop-circle', set: setName, ref: nameRef },
        {
            label: 'Username',
            placeholder: 'Enter your username',
            value: username,
            icon: 'user',
            set: setUsername,
            ref: usernameRef
        },
        {
            label: 'Mobile Number',
            placeholder: 'Enter your mobile number',
            value: 'AED12345673748',
            icon: 'hash',
            set: setMobileNumber,
            ref: mobileNumberRef
        },
        { label: 'Password', placeholder: 'Enter password', icon: 'lock', set: setPassword, ref: passwordRef },
        {
            label: 'Referral Code',
            placeholder: 'Enter your referral code',
            value: '821779FF',
            icon: 'link',
            set: undefined,
            ref: referralCodeRef
        },
    ];

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleUpdateUser = async () => {
        try {
            let body = JSON.stringify({
                authorId: 0,
                completeName: name,
                username,
                mobileNumber,
                password,
            });

            const response = await fetch(`${GAMING_DOMAIN}/api/ApplicationUsers/UpdateUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body
            });

            const result = await response.json();
            if (response.ok) {
                setModalMessage('Profile updated successfully!');
                setIsSuccess(true);
                setModalVisible(true);
            } else {
                setModalMessage(result.message || 'Unable to process the request. Please try again later.');
                setIsSuccess(false);
                setModalVisible(true);
            }
        } catch (error) {
            setModalMessage('Something went wrong. Please try again later.');
            setIsSuccess(false);
            setModalVisible(true);
        }
    };

    return (
        <View style={{...styles.container, backgroundColor: colors.background}}>
            <HeaderBar title="Account Settings" leftIcon="back"/>
            <View style={[GlobalStyleSheet.container, {padding: 0, flex: 1}]}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Animatable.View
                        animation="fadeInUp"
                        duration={1000}
                        delay={800}
                        style={styles.formContainer}
                    >
                        <Text
                            style={{
                                ...FONTS.font,
                                ...FONTS.fontMedium,
                                color: colors.text,
                                marginBottom: 15,
                            }}
                        >
                            Edit your personal profile
                        </Text>
                        {fields.map((field, index) => (
                            <Animatable.View
                                key={index}
                                animation="fadeInUp"
                                duration={1000}
                                delay={800 + index * 100}
                                style={styles.inputGroup}
                            >
                                <Text style={{...FONTS.fontXs, color: COLORS.primary, marginBottom: 6}}>
                                    {field.label}
                                </Text>
                                <View
                                    style={{
                                        ...GlobalStyleSheet.shadow,
                                        backgroundColor: colors.card,
                                        borderRadius: SIZES.radius,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                >
                                    <View style={styles.inputIcon}>
                                        <FeatherIcon name={field.icon} color={COLORS.primary} size={18}/>
                                    </View>
                                    <TextInput
                                        ref={field.ref}
                                        value={field.value}
                                        onFocus={() => setFocusField(field.label)}
                                        onBlur={() => setFocusField(null)}
                                        onChangeText={(value) => {
                                            if (field.set) field.set(value);
                                        }}
                                        style={[
                                            styles.input,
                                            {color: colors.text, backgroundColor: colors.card},
                                            focusField === field.label ? styles.inputActive : undefined,
                                        ]}
                                        placeholder={field.placeholder}
                                        placeholderTextColor={colors.text}
                                        editable={field.ref !== referralCodeRef}
                                        secureTextEntry={field.ref === passwordRef ? handlePassword : false}
                                    />
                                    {field.ref === passwordRef ? (
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
                                    ) : ""}
                                </View>
                            </Animatable.View>
                        ))}
                        <View style={[GlobalStyleSheet.row, {marginTop: 30}]}>
                            <View style={{...GlobalStyleSheet.col50}}>
                            </View>
                            <View style={{...GlobalStyleSheet.col50}}>
                                <CustomButton title='Update Account' onPress={handleUpdateUser}/>
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    formContainer: {
        marginHorizontal: 15,
        marginBottom: 30,
        marginTop: 10,
    },
    inputGroup: {
        marginBottom: 15,
    },
    inputIcon: {
        padding: 10,
    },
    input: {
        flex: 1,
        height: 40,
        paddingHorizontal: 10,
        borderRadius: SIZES.radius,
    },
    inputActive: {
        borderWidth: 1,
        borderColor: COLORS.primary,
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

export default Account;
