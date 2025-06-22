import React, { useRef, useState } from "react";
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    Modal,
    Platform,
    ScrollView, StyleSheet,
} from "react-native";
import Ripple from "react-native-material-ripple";
import RBSheet from "react-native-raw-bottom-sheet";

type RBSheetRef = {
    open: () => void;
    close: () => void;
};

import { useTheme } from "@react-navigation/native";
import FeatherIcon from "react-native-vector-icons/Feather";
import { COLORS, FONTS, ICONS, IMAGES, SIZES } from "../../constants/theme";
import { GlobalStyleSheet } from "../../constants/styleSheet";
import CustomButton from "../customButton";
import WithdrawCryptoQr from "./withdrawCryptoQr";
import WithdrawCryptoOTP from "./withdrawCryptoOTP";
import { LinearGradient } from "expo-linear-gradient";

interface Coin {
    coin: string;
}

const CoinItem: Coin[] = [
    {
        coin: "Draw 1",
    },
    {
        coin: "Draw 2",
    },
    {
        coin: "Draw 3",
    },
];

const BetModal: React.FC = () => {
    const { colors } = useTheme();
    const theme = useTheme();
    const refRBSheet = useRef<RBSheetRef>(null);

    const [itemValue, setItemValue] = useState<Coin>({
        coin: "Draw",
    });
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [withdrawRBSheet, setWithdrawRBSheet] = useState<string>("");

    return (
        <>
            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                <View
                    style={[
                        GlobalStyleSheet.container,
                        { padding: 0, flex: 1, backgroundColor: colors.card },
                        Platform.OS === "ios" && { paddingTop: 40 },
                    ]}
                >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={{ padding: 12 }}
                        >
                            <FeatherIcon name="arrow-left" size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView>
                        {CoinItem.map((data, index) => (
                            <View key={index}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setItemValue(data);
                                        setModalVisible(false);
                                    }}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        paddingVertical: 12,
                                        paddingHorizontal: 15,
                                    }}
                                >
                                    <Text
                                        style={{
                                            ...FONTS.font,
                                            ...FONTS.fontMedium,
                                            color: colors.text,
                                            flex: 1,
                                        }}
                                    >
                                        {data.coin}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </Modal>

            <View style={[{ padding: 0, flex: 1 }]}>
                <ScrollView
                    contentContainerStyle={{
                        width: 150,
                    }}
                    showsHorizontalScrollIndicator={false}
                ><View style={{marginBottom:15}}>
                    <View style={styles.inputIcon}>
                        <Text style={{...FONTS.font,...FONTS.fontBold,color:COLORS.success}}>₱</Text>
                    </View>
                    <TextInput
                        style={[styles.inputStyle,{borderColor:colors.border,color:colors.text}]}
                        placeholder=''
                        placeholderTextColor={colors.text}
                    />
                </View>
                    <TouchableOpacity activeOpacity={1}>
                        <View
                            style={{
                                backgroundColor: colors.card,
                                borderRadius: SIZES.radius,
                                ...GlobalStyleSheet.shadow,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => setModalVisible(true)}
                                style={{
                                    backgroundColor: colors.card,
                                    ...GlobalStyleSheet.formControl,
                                    marginBottom: 0,
                                    paddingHorizontal: 15,
                                    flexDirection: "row",
                                    alignItems: "center",
                                }}
                            >
                                <Text
                                    style={{
                                        ...FONTS.font,
                                        color: colors.text,
                                        flex: 1,
                                    }}
                                >
                                    {itemValue.coin}
                                </Text>
                                <FeatherIcon
                                    color={colors.text}
                                    size={20}
                                    name="chevron-down"
                                />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </>
    );
};


const styles = StyleSheet.create({
    inputStyle:{
        ...FONTS.font,
        height:50,
        paddingLeft:60,
        borderWidth : 1,
        borderRadius: SIZES.radius,
    },
    inputIcon:{
        backgroundColor:COLORS.primaryLight,
        height:40,
        width:40,
        borderRadius:10,
        position : 'absolute',
        left:5,
        top : 5,
        alignItems:'center',
        justifyContent:'center',
    },
    eyeIcon:{
        position:'absolute',
        height:50,
        width:50,
        alignItems:'center',
        justifyContent:'center',
        right:0,
        zIndex:1,
        top:0,
    }
})

export default BetModal;
