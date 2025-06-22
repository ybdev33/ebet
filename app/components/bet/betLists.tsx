import React from 'react';
import BetList from './betList';
import DepositCryptoModal from '../../components/modal/depositCryptoModal';
import WithdrawCryptoModal from '../../components/modal/withdrawCryptoModal';
import RBSheet from "react-native-raw-bottom-sheet";
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalStyleSheet } from '../../constants/styleSheet';
import { Platform } from 'react-native';

class BetLists extends React.Component {

    state = {
        data: this.props.data,
        swiping: false,
        rbSheet:'',
    }

    cleanFromScreen(id) {
        const data = this.state.data.filter(item => {
            return item.id !== id;
        });
        this.setState({ data });
    }


    renderItems() {

        return this.state.data.map((item) => {

            return (
                <BetList
                    theme={this.props.theme}
                    key={item.id}
                    swipingCheck={(swiping) => this.setState({ swiping })}
                    coin={item.coin}
                    coinName={item.coinName}
                    amount={item.amount}
                    tag={item.tag}
                    id={item.id}
                    cleanFromScreen={(id) => this.cleanFromScreen(id)}
                    leftButtonPressed={() => console.log('Delete')}
                />
            );
        });


    }
    render() {

        return (
            <>
                <RBSheet
                    ref={ref => {
                        this.RBSheet = ref;
                    }}
                    closeOnDragDown={true}
                    height={430}
                    openDuration={300}
                    customStyles={{
                        wrapper: {
                            //backgroundColor: this.props.colors.modalBackLayer,
                        },
                        container:{
                            backgroundColor: this.props.theme.colors.background,
                            borderTopLeftRadius:15,
                            borderTopRightRadius:15,
                        },
                        draggableIcon: {
                            width:90,
                            backgroundColor: this.props.theme.colors.borderColor,
                        }
                    }}
                >
                    {this.props.theme.dark &&
                        <LinearGradient
                            colors={["rgba(22,23,36,.7)","rgba(22,23,36,0)"]}
                            style={{
                                position:'absolute',
                                height:'100%',
                                width:'100%',
                            }}
                        >
                        </LinearGradient>
                    }
                </RBSheet>
                <GestureHandlerRootView
                    style={[Platform.OS === 'web' && GlobalStyleSheet.container,{padding:0}]}
                >
                    {this.renderItems()}
                </GestureHandlerRootView>
            </>
        );
    }

}

export default BetLists;