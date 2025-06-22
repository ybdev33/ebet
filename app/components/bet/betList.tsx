import React from 'react';
import {
    View,
    Text,
    Animated,
    TouchableOpacity,
    StyleSheet,
    Image,
} from 'react-native';

import {COLORS, FONTS, ICONS, SIZES} from '../../constants/theme';

import {
    LineChart,
} from "react-native-chart-kit";
import {LinearGradient} from 'expo-linear-gradient';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Ripple from 'react-native-material-ripple';
import {GlobalStyleSheet} from '../../constants/styleSheet';


class BetList extends React.Component {

    renderRightActions = (progress, dragX) => {
        const opacity = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0]
        });
        return (
            <>
                <Animated.View
                    style={[
                        styles.actionText,
                        {
                            opacity: opacity
                        },
                    ]}
                >
                    <LinearGradient
                        style={styles.btnareaRight}
                        start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                        colors={['#c94953', '#ba004d']}
                    >
                        <TouchableOpacity style={styles.swipeBtn}>
                            <Image style={styles.swipeIcon} source={ICONS.delete}/>
                            <Text
                                style={styles.textStyle}
                                numberOfLines={1}
                            >
                                Remove
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>
            </>
        );
    };


    render() {
        return (
            <Swipeable
                ref={this.updateRef}
                friction={2}
                enableTrackpadTwoFingerGesture
                renderRightActions={this.renderRightActions}
                leftThreshold={10}
            >

                <View
                    style={{
                        flex: 1,
                        alignSelf: 'stretch',
                        flexDirection: 'row',
                    }}
                >
                    <Text style={{
                        ...styles.tbodyItem,
                        color: this.props.theme.colors.title,
                        flex: 1.3,
                        paddingLeft: 15,
                        fontSize: 15,
                        marginTop: 5
                    }}>{this.props.coinName}</Text>
                    <Text style={{...styles.tbodyItem, color: COLORS.text}}>{this.props.amount}</Text>
                    <Text style={{
                        ...styles.tbodyItem,
                        color: COLORS.text,
                        flex: 0.5,
                        textAlign: 'right',
                        paddingRight: 15
                    }}>{this.props.tag}</Text>
                </View>
            </Swipeable>
        );
    }
}

const styles = StyleSheet.create({
    containerStyle: {
        flex: 1,
        flexDirection: 'row',
    },
    coinList: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 6,
        marginHorizontal: 10,
        marginVertical: 4
    },
    textStyle: {
        fontSize: 8,
        ...FONTS.fontMedium,
        color: '#fff',
    },
    rightButtonContainer: {
        position: 'absolute',
        right: 0,
    },
    swipeIcon: {
        height: 13,
        width: 13,
        marginBottom: 3,
        marginTop: 6,
        resizeMode: 'contain',
        tintColor: '#fff',
    },
    swipeBtn: {
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    btnareaRight: {
        paddingVertical: 2,
        top: 4,
        borderTopLeftRadius: SIZES.radius,
        borderBottomLeftRadius: SIZES.radius,
    },
    tbodyItem: {
        flex: 1,
        alignSelf: 'stretch',
        paddingHorizontal: 10,
        paddingVertical: 12,
        ...FONTS.font,
    },
});

export default BetList;
