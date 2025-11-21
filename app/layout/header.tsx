import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useTheme, DrawerActions } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { FONTS } from '../constants/theme';
import { GlobalStyleSheet } from '../constants/styleSheet';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HeaderBarProps = {
    title: string;
    leftIcon?: 'back' | 'menu'; // add 'menu' for drawer toggle
    onPressLeft?: () => void;
};

const HeaderBar: React.FC<HeaderBarProps> = ({ title, leftIcon, onPressLeft }) => {
    const { colors } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    // Handle back or menu action safely
    const handleLeftPress = () => {
        if (onPressLeft) {
            onPressLeft();
        } else if (leftIcon === 'menu') {
            navigation.dispatch(DrawerActions.toggleDrawer());
        } else if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('drawernavigation', {
                screen: 'BottomNavigation',
                params: { screen: 'Home' },
            });
        }
    };

    return (
        <View
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 10,
                zIndex: 1,
                backgroundColor: colors.card,
            }}
        >
            <View
                style={[
                    GlobalStyleSheet.container,
                    {
                        padding: 0,
                        height: 48,
                        backgroundColor: colors.card,
                        flexDirection: 'row',
                        alignItems: 'center',
                    },
                ]}
            >
                <View style={{ height: 48, width: 48 }}>
                    {leftIcon && (
                        <TouchableOpacity
                            onPress={handleLeftPress}
                            style={{
                                height: '100%',
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <FeatherIcon
                                name={leftIcon === 'back' ? 'arrow-left' : 'menu'}
                                size={22}
                                color={colors.title}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                <Text
                    style={{
                        flex: 1,
                        textAlign: 'center',
                        ...FONTS.h6,
                        ...FONTS.fontMedium,
                        color: colors.title,
                    }}
                >
                    {title}
                </Text>

                <View style={{ height: 48, width: 48 }} />
            </View>
        </View>
    );
};

export default HeaderBar;
