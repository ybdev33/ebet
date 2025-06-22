import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { GlobalStyleSheet } from '../../constants/styleSheet';
import { COLORS, FONTS } from '../../constants/theme';

const TableOddEven = () => {

    const {colors} = useTheme();
    const theme = useTheme();

    const TableData = [
        {
            name : "John Doe",
            email : "johndoe@gmail.com",
            age : 20,
        },
        {
            name : "John Doe",
            email : "johndoe@gmail.com",
            age : 20,
        },
        {
            name : "John Doe",
            email : "johndoe@gmail.com",
            age : 20,
        },
        {
            name : "John Doe",
            email : "johndoe@gmail.com",
            age : 20,
        },
    ]

    return (
        <>
                <View
                    style={{
                        ...GlobalStyleSheet.card,
                        backgroundColor:colors.card,
                        padding:5,
                        ...GlobalStyleSheet.shadow
                    }}
                >
                    <View
                        style={{
                            flex: 1,
                            alignSelf: 'stretch',
                            flexDirection: 'row',
                        }}
                    >
                        <Text style={{...styles.theadItem,color:colors.text,flex:.6,paddingLeft:15}}>Name</Text>
                        <Text style={{...styles.theadItem,color:colors.text}}>Email</Text>
                        <Text style={{...styles.theadItem,color:colors.text,flex:0.5,textAlign:'right',paddingRight:15}}>Age</Text>
                    </View>
                    {TableData.map((data,index) => {
                        return(
                            <View
                                key={index}
                                style={[{
                                    flex: 1,
                                    alignSelf: 'stretch',
                                    flexDirection: 'row',
                                } , index % 2 === 0 && {
                                    backgroundColor : theme.dark ? colors.background : '#eee',
                                }]}
                            >
                                <Text style={[{...styles.tbodyItem,color:colors.title,flex:.6,paddingLeft:15}, index % 2 === 0 && {color : colors.title}]}>{data.name}</Text>
                                <Text numberOfLines={1} style={[{...styles.tbodyItem,color:colors.title}, index % 2 === 0 && {color : colors.title}]}>{data.email}</Text>
                                <Text style={[{...styles.tbodyItem,color:colors.title,flex:0.5,textAlign:'right',paddingRight:15}, index % 2 === 0 && {color : colors.title}]}>{data.age}</Text>
                            </View>
                        )
                    })}
                </View>
        </>
    );
};

const styles = StyleSheet.create({
    theadItem:{
        flex: 1, 
        alignSelf: 'stretch',
        paddingHorizontal:10,
        paddingVertical:12,
        ...FONTS.font,
        color:COLORS.text,
    },
    tbodyItem:{
        flex: 1, 
        alignSelf: 'stretch',
        paddingHorizontal:10,
        paddingVertical:12,
        ...FONTS.font,
        ...FONTS.fontMedium,
        color:COLORS.title,
    }
})

export default TableOddEven;