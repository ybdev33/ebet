import React from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Platform,
} from "react-native";
import FeatherIcon from "react-native-vector-icons/Feather";
import { COLORS, FONTS, SIZES } from "@/app/constants/theme";
import { GlobalStyleSheet } from "@/app/constants/styleSheet";
import BetLists from "@/app/components/bet/betLists";
import { useTheme } from "@react-navigation/native";

interface Bet {
    id: string;
    draw: string;
    amount: string;
    isRmb: boolean;
    combination: string[];
}

interface BetsModalProps {
    visible: boolean;
    onClose: () => void;
    data: Bet[];
    navigate: (destination: string) => void;
    onPrint: () => void;
    onDelete: () => void;
}

const BetsModal: React.FC<BetsModalProps> = ({ visible, onClose, data, navigate, onPrint, onDelete }) => {
    const theme = useTheme();
    const { colors } = theme;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
                            <View
                                style={[
                                    GlobalStyleSheet.container,
                                    {
                                        padding: 0,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingHorizontal: 0,
                                        paddingVertical: 0,
                                        marginBottom: 12,
                                    },
                                ]}
                            >
                                <View style={[styles.cardIco, {borderWidth: 1, borderColor: colors.border}]}>
                                    <Text style={styles.cardText}>{data.length}</Text>
                                </View>

                                <Text
                                    style={{
                                        ...FONTS.h6,
                                        color: COLORS.text,
                                        marginTop: 5,
                                        marginLeft: 10,
                                    }}
                                >{`Bet${data.length === 1 ? '' : 's'}`}</Text>
                                <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 'auto'}}>
                                    <TouchableOpacity onPress={onClose}>
                                        <FeatherIcon name="x" size={24} color={COLORS.white} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View
                                style={[
                                    {
                                        backgroundColor: colors.background,
                                        borderRadius: 8,
                                        flexDirection: 'row',
                                        height: 40,
                                        alignItems: 'center',
                                        width: '100%',
                                        ...GlobalStyleSheet.shadow,
                                    },
                                ]}
                            >
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        color: colors.text,
                                        ...styles.tableItemHead,
                                        flexShrink: 0,
                                        flexWrap: 'nowrap',
                                        minWidth: 150,
                                    }}
                                >
                                    Combination
                                </Text>
                                <Text numberOfLines={1} style={{ color: colors.text, ...styles.tableItemHead }}>Amount</Text>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ ...FONTS.font, ...FONTS.fontMedium, color: colors.text }}>Draw</Text>
                                </View>
                            </View>

                            {data.length > 0 ? (
                                <View style={{ overflow: 'scroll' }}>
                                    <BetLists
                                        key={data.length}
                                        data={data}
                                        theme={theme}
                                        destination="Trade"
                                        navigate={navigate}
                                        onDelete={onDelete}
                                    />

                                    <View  style={{marginTop:0, marginVertical: 15, borderTopWidth: 1}}></View>
                                    <TouchableOpacity style={[styles.iconButton, {backgroundColor: COLORS.primary}]} onPress={onPrint}>
                                        <Text style={styles.buttonText}>Print</Text>
                                        <FeatherIcon name="send" size={16} color={COLORS.title} style={styles.icon} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <Text style={{ color: COLORS.text, textAlign: "center", marginTop: 10 }}>
                                    No bets placed yet.
                                </Text>
                            )}

                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContainer: {
        width: "100%",
        maxHeight: "80%",
        borderRadius: 10,
        padding: 15,
        ...Platform.select({
            web: {
                overflow: "auto",
            },
        }),
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    title: {
        ...FONTS.h5,
        color: COLORS.white,
    },
    tableItemHead: {
        ...FONTS.font,
        paddingHorizontal: 15,
        flexBasis: 140,
        flexShrink: 2,
    },
    iconButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.warning,
        paddingVertical: 10,
        borderRadius: 8,
    },
    icon: {
    },
    buttonText: {
        color: COLORS.title,
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 5,
        paddingVertical: 1,
    },
    cardIco: {
        height: 35,
        width: 35,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: SIZES.radius,
        backgroundColor: "#000",
    },
    cardText: {
        color: COLORS.primary,
            textAlign: "center",
            fontSize: 18,
            fontWeight: "bold",
            verticalAlign: "middle",
    },
});

export default BetsModal;
