import React from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/styleSheet';
import Header from '../../layout/header';
import ListStyle1 from '../../components/list/ListStyle1';
import { Snackbar } from 'react-native-paper';


const Snackbars = () => {

    const {colors} = useTheme();

    const [visible, setVisible] = React.useState(false);
	const [snackText, setSnackText] = React.useState("");
	const [snackType, setSnackType] = React.useState("");
	
	const onDismissSnackBar = () => setVisible(false);

    const onToggleSnackBar = (type,text) => {
		setSnackText(text);
		setSnackType(type);
		setVisible(!visible);
	};

    return (
        <>
            <SafeAreaView style={{flex:1,backgroundColor:colors.background}}>
                <Header title={'Snackbars'} titleLeft leftIcon={'back'}/>
                <ScrollView>
                    <View style={{...GlobalStyleSheet.container}}>
                        <View
                            style={{
                                ...GlobalStyleSheet.card,
                                backgroundColor:colors.card,
                                ...GlobalStyleSheet.shadow,
                            }}
                        >
                            <ListStyle1
                                onPress={() => onToggleSnackBar('success',"Something's wrong!")}
                                arrowRight
                                icon={<FontAwesome size={20} color={colors.title} name={'check'} />}
                                title={'Confirmation Snackbar'}
                            />
                            <ListStyle1
                                onPress={() => onToggleSnackBar('warning',"Something's wrong!")}
                                arrowRight
                                icon={<FontAwesome size={20} color={colors.title} name={'warning'} />}
                                title={'Warning Snackbar'}
                            />
                            <ListStyle1
                                onPress={() => onToggleSnackBar('info',"We're on it")}
                                arrowRight
                                icon={<FontAwesome size={20} color={colors.title} name={'refresh'} />}
                                title={'Loading Snackbar'}
                            />
                            <ListStyle1
                                onPress={() => onToggleSnackBar('error',"Error Occured")}
                                arrowRight
                                icon={<FontAwesome size={20} color={colors.title} name={'close'} />}
                                title={'Error Snackbar'}
                            />
                        </View>
                    </View>
                </ScrollView>
                <Snackbar
                    visible={visible}
                    onDismiss={onDismissSnackBar}
                >
                    {snackText}
                </Snackbar>
            </SafeAreaView>
        </>
    );
};


export default Snackbars;