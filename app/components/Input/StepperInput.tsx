import React, {
    forwardRef,
    useRef,
    useImperativeHandle
} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList
} from 'react-native';
import FeatherIcon from "react-native-vector-icons/Feather";
import { COLORS } from "@/app/constants/theme";

interface StepperInputProps {
    label: string;
    options: string[];
    value: string;
    setValue: (value: string) => void;
    currentIndex: number;
    setCurrentIndex: (index: number) => void;
    editable?: boolean;
    flatListRef?: React.RefObject<FlatList>;
    onSubmitEditing?: () => void;
}

const StepperInput = forwardRef<TextInput, StepperInputProps>(
    ({
         label,
         options,
         value,
         setValue,
         currentIndex,
         setCurrentIndex,
         editable = true,
         flatListRef,
         onSubmitEditing
     }, ref) => {

        const inputRef = useRef<TextInput | null>(null);

        useImperativeHandle(ref, () => ({
            focus: () => {
                inputRef.current?.focus();
            }
        }));

        const handleLeft = () => {
            if (currentIndex > 0) {
                const newIndex = currentIndex - 1;
                setCurrentIndex(newIndex);
                setValue(options[newIndex]);
                inputRef.current?.blur();
            }
        };

        const handleRight = () => {
            if (currentIndex < options.length - 1) {
                const newIndex = currentIndex + 1;
                setCurrentIndex(newIndex);
                setValue(options[newIndex]);
                inputRef.current?.blur();
            }
        };

        const handleFocus = () => {
            inputRef.current?.setSelection(0, value.length);
            if (flatListRef?.current) {
                flatListRef.current.scrollToOffset({ offset: 200, animated: true });
            }
        };

        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={handleLeft} style={styles.arrow}>
                    <FeatherIcon name="chevron-left" style={styles.arrowText} />
                </TouchableOpacity>
                <View style={styles.betContainer}>
                    <Text style={styles.betText}>{label} </Text>
                    {editable && (
                        <TextInput
                            ref={inputRef}
                            style={styles.betInput}
                            value={value}
                            onChangeText={setValue}
                            keyboardType="numeric"
                            onFocus={handleFocus}
                            editable={true}
                            onSubmitEditing={onSubmitEditing}
                            returnKeyType="done"
                        />
                    )}
                </View>
                <TouchableOpacity onPress={handleRight} style={styles.arrow}>
                    <FeatherIcon name="chevron-right" style={styles.arrowText} />
                </TouchableOpacity>
            </View>
        );
    });

const styles = StyleSheet.create({
    container: {
        width: 180,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.darkBorder,
        borderRadius: 10,
        paddingHorizontal: 5,
        justifyContent: "space-between",
        marginBottom: 10,
    },
    arrow: {},
    arrowText: {
        fontSize: 28,
        color: COLORS.primary,
    },
    betContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 44,
    },
    betText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: "bold",
    },
    betInput: {
        fontSize: 16,
        color: COLORS.white,
        textAlign: "center",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 5,
        marginLeft: 5,
        height: 37,
        width: 55,
        lineHeight: 17,
    }
});

export default StepperInput;
