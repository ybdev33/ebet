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
import {LinearGradient} from 'expo-linear-gradient';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import FeatherIcon from 'react-native-vector-icons/Feather';

class BetList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
        };
        this.swipeRef = React.createRef();
    }

    handleDelete = () => {
        const { id, cleanFromScreen } = this.props;
        if (cleanFromScreen && typeof cleanFromScreen === 'function') {
            cleanFromScreen(id);
        }
    };

    renderRightActions = (progress, dragX) => {
        const opacity = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
        });
        return (
            <Animated.View style={[styles.actionText, {opacity}]}>
                <LinearGradient
                    style={styles.btnareaRight}
                    start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                    colors={['#c94953', '#ba004d']}
                >
                    <TouchableOpacity style={styles.swipeBtn} onPress={this.handleDelete}>
                        <Image style={styles.swipeIcon} source={ICONS.delete}/>
                        <Text style={styles.textStyle} numberOfLines={1}>Remove</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </Animated.View>
        );
    };

    toggleExpand = () => {
        this.setState(prevState => ({expanded: !prevState.expanded}));
    };

    getPermutations = (inputStr) => {
        const digitsOnly = inputStr.replace(/\D/g, '');
        const results = [];

        const permute = (arr, m = []) => {
            if (arr.length === 0) {
                results.push(m.join(''));
            } else {
                for (let i = 0; i < arr.length; i++) {
                    const curr = arr.slice();
                    const next = curr.splice(i, 1);
                    permute(curr.slice(), m.concat(next));
                }
            }
        };

        permute(digitsOnly.split(''));
        return [...new Set(results)];
    };

    render() {
        const {combination, amount, draw, isRmb, theme} = this.props;
        const {expanded} = this.state;

        const permutations = isRmb ? this.getPermutations(combination) : [];

        return (
            <Swipeable
                ref={this.swipeRef}
                friction={2}
                enableTrackpadTwoFingerGesture
                renderRightActions={this.renderRightActions}
                leftThreshold={10}
            >
                <View style={{flex: 1, alignSelf: 'stretch', flexDirection: 'column'}}>
                    <TouchableOpacity
                        onPress={() => isRmb && this.toggleExpand()}
                        style={[styles.rowContainer, { backgroundColor: theme.colors.card }]}
                    >
                        <Text style={{
                            ...styles.tbodyItem,
                            color: theme.colors.title,
                            paddingLeft: 15,
                            fontSize: 15,
                        }}>{combination}
                            <View style={{ paddingTop: 7, paddingLeft: 15 }}>
                                {isRmb && (
                                    <FeatherIcon
                                        name={expanded ? "chevron-up" : "chevron-down"}
                                        size={16}
                                        color={COLORS.text}
                                    />
                                )}
                            </View>
                        </Text>
                        <Text style={{
                            ...styles.tbodyItem,
                            color: COLORS.text,
                            textAlign: 'center',
                            textAlignVertical: 'center',
                        }}>{amount}</Text>
                        <Text style={{
                            ...styles.tbodyItem,
                            color: COLORS.text,
                            flex: 0.5,
                            textAlign: 'right',
                            paddingRight: 15
                        }}>{draw}</Text>
                    </TouchableOpacity>

                    {isRmb && expanded && (
                        <View style={styles.collapseRow}>
                            {permutations.map((item, index) => (
                                <View key={index} style={styles.permutationRow}>
                                    <Text style={[styles.textStyle, styles.permutationText]}>
                                        {item}
                                    </Text>
                                    <Text style={[styles.textStyle, styles.amountText]}>
                                        {(amount / permutations.length).toFixed(2)}
                                    </Text>
                                    <Text style={[styles.textStyle, styles.drawText]}>
                                        {draw}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </Swipeable>
        );
    }
}

const styles = StyleSheet.create({
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    textStyle: {
        fontSize: 8,
        ...FONTS.fontMedium,
        color: '#fff',
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
        paddingHorizontal: 10,
        paddingVertical: 12,
        ...FONTS.font,
    },
    collapseRow: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: COLORS.lightGray,
    },
    permutationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        paddingHorizontal: 5,
    },
    permutationText: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text,
        textAlign: 'left',
        marginLeft: 15,
    },
    amountText: {
        flex: 1,
        fontSize: 15,
        textAlign: 'center',
        color: COLORS.text,
        marginLeft: -15,
    },
    drawText: {
        flex: 0.5,
        fontSize: 15,
        textAlign: 'right',
        color: COLORS.text,
    },
});

export default BetList;