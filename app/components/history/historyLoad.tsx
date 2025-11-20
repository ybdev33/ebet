import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import HistoryLoadTab from './HistoryLoadTab'; // Extract your existing accordion/history UI to a separate component

const HistoryLoad: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'bet' | 'load'>('bet');

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }}>
                {activeTab === 'bet' && <HistoryLoadTab type="bet" />}
                {activeTab === 'load' && <HistoryLoadTab type="load" />}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        margin: 10,
        borderRadius: 10,
        backgroundColor: '#eee',
    },
    tab: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: '#007AFF',
    },
    tabText: {
        fontWeight: 'bold',
        color: '#555',
    },
    activeTabText: {
        color: '#fff',
    },
});

export default HistoryLoad;
