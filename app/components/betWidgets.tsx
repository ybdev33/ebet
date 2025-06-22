import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    Animated,
    ListRenderItem,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { LineChart } from "react-native-chart-kit";
import Ripple from 'react-native-material-ripple';

import { FONTS, SIZES, COLORS, ICONS } from '../constants/theme';
import { GlobalStyleSheet } from '../constants/styleSheet';

// Define the type for card data
type CardData = {
    id: string;
    pic: any; // Update `any` with the appropriate image source type if available
    title: string;
    balance: string;
    amount?: string;
    status: "total" | "profit&loss" | "reward" | "pay";
    navigate: string;
};

const cardData: CardData[] = [
    {
        id: "2",
        pic: ICONS.chart,
        title: "Draw",
        balance: "3",
        status: "profit&loss",
        navigate: 'profitloss',
    },
    {
        id: "3",
        pic: ICONS.trophy,
        title: "Win",
        balance: "21,560.57",
        status: "reward",
        navigate: 'rewards',
    },
    {
        id: "4",
        pic: ICONS.trophy,
        title: "Hits",
        balance: "3",
        status: "pay",
        navigate: 'rewards',
    }
];

const BetWidgets: React.FC = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const renderItem: ListRenderItem<CardData> = ({ item }) => (
        <Ripple
            onPress={() => navigation.navigate(item.navigate as never)} // Adjust navigation type if needed
            style={[
                {
                    width:118,
                    borderRadius: 12,
                    position: 'relative',
                    backgroundColor: colors.card,
                    ...GlobalStyleSheet.shadow,
                    marginBottom: 5,
                    marginRight: 7,
                },
            ]}
        >
            <View style={{ paddingHorizontal: 15, paddingVertical: 10 }}>
                <Text style={{ ...FONTS.fontSm, marginBottom: 6, color: COLORS.success }}>{item.title}</Text>
                <Text style={{ ...FONTS.h6, color: colors.text }}>{item.balance}</Text>
            </View>
        </Ripple>
    );

    return (
        <FlatList
            horizontal
            contentContainerStyle={{
                paddingTop: 7,
            }}
            showsHorizontalScrollIndicator={false}
            data={cardData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
        />
    );
};

export default BetWidgets;
