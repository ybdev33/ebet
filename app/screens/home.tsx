import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
  TextInput,
  Text,
} from 'react-native';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Ripple from 'react-native-material-ripple';
import Constants from 'expo-constants';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import BalanceChart from '../components/totalBalanceChart';
import BalanceWidgets from '../components/balanceWidgets';
import DrawResult from '../components/DrawResult';
import SuccessModal from '../components/modal/SuccessModal';

import { getSession } from '../helpers/sessionHelper';
import { GlobalStyleSheet } from '../constants/styleSheet';
import { COLORS, FONTS, SIZES } from '@/app/constants/theme';

interface DashboardResult {
  resultList?: any[];
  [key: string]: any;
}

interface ResultItem {
  categoryGroup: string;
  drawCategory: string;
  combination: string;
}

interface UserSession {
  data: {
    userId: string;
  };
}

interface ApiResponse<T> {
  data: T;
}

const { GAMING_DOMAIN, GAMING_DEV, GAMING_API } =
  Constants.expoConfig?.extra || {};

const detectedPort =
  typeof window !== 'undefined' ? window.location.port : '';

const API_DOMAIN =
  (detectedPort === '8081' || detectedPort === '6049') && GAMING_DEV
    ? GAMING_DEV
    : GAMING_DOMAIN;

const Home: React.FC = () => {
  const { colors } = useTheme();

  const [amount, setAmount] = useState<string>('Loading...');
  const [dashData, setDashData] = useState<DashboardResult | null>(null);
  const [resultData, setResultData] = useState<ResultItem | null>(null);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const [date, setDate] = useState<Date>(new Date());
  const [tab, setTab] = useState<'gross' | 'result'>('gross');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async (): Promise<void> => {
        try {
          const user = (await getSession('userSession')) as UserSession;
          const userId = user?.data?.userId;

          if (!userId) return;

          await fetchUserLoad(userId);
          await fetchDashboard(userId);
          await fetchResult();
        } catch {
          showError('Failed to load user session.');
        }
      };

      const fetchUserLoad = async (userId: string): Promise<void> => {
        try {
          const response = await fetch(
            `${API_DOMAIN}/api/LoadManagement/GetUserLoad?authorId=${userId}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `ebonline ${GAMING_API}`,
              },
            }
          );

          const result: ApiResponse<{ amount: string }> =
            await response.json();

          if (response.ok && isActive) {
            setAmount(result?.data?.amount ?? '0');
          }
        } catch {
          showError('Something went wrong. Please try again later.');
        }
      };

      const fetchDashboard = async (userId: string): Promise<void> => {
        try {
          const formattedDate = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Manila',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(date);

          const response = await fetch(
            `${API_DOMAIN}/api/Common/GetDashBoardDetails?authorId=${userId}&date=${formattedDate}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `ebonline ${GAMING_API}`,
              },
            }
          );

          const result: ApiResponse<DashboardResult> =
            await response.json();

          if (response.ok && isActive) {
            setDashData(result.data);
          }
        } catch {
          showError('Failed to fetch dashboard data.');
        }
      };

    const fetchResult = async (): Promise<void> => {
      try {
        const formattedDate = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Manila',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(date);

        const response = await fetch(
          `${API_DOMAIN}/api/Common/GetHitsResultCategoryGroup?date=${formattedDate}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `ebonline ${GAMING_API}`,
            },
          }
        );

        const result: ApiResponse<DashboardResult> =
          await response.json();

        if (response.ok && isActive) {
          setResultData(result.data);
        }
      } catch {
        showError('Failed to fetch dashboard data.');
      }
    };

      fetchData();

      return () => {
        isActive = false;
      };
    }, [date])
  );

  const showError = (message: string) => {
    setModalMessage(message);
    setIsSuccess(false);
    setModalVisible(true);
  };

  const getNumberColor = (num: string) => {
    const numberColors: Record<string, string> = {
      '0': COLORS.primary,
      '1': COLORS.danger,
      '2': COLORS.warning,
      '3': COLORS.info,
      '4': COLORS.success,
      '5': '#bc157b',
    };

    return numberColors[num] || colors.border;
  };

  return (
    <View
      style={[
        { backgroundColor: colors.background, flex: 1 },
        Platform.OS === 'web' && GlobalStyleSheet.container,
      ]}
    >
      <ScrollView>
        <BalanceChart amount={amount} />

        <Animatable.View animation="fadeInRight" duration={500} delay={800}>
          <BalanceWidgets dashData={dashData} />
        </Animatable.View>

        <View style={{ padding: 10 }}>
          <View
              style={{
                  height: 48,
                  borderWidth: 1,
                  borderColor: colors.borderColor,
                  backgroundColor: colors.card,
                  borderRadius: SIZES.radius,
                  flexDirection: 'row',
                  ...GlobalStyleSheet.shadow,
              }}
          >
            <FeatherIcon
              style={styles.calendarIcon}
              name="calendar"
              size={20}
              color={COLORS.primary}
            />

            <View style={styles.datePickerWrapper}>
                <View
                    style={{
                        height: 48,
                        borderWidth: 1,
                        borderColor: colors.borderColor,
                        backgroundColor: colors.card,
                        borderRadius: SIZES.radius,
                        flexDirection: 'row',
                        ...GlobalStyleSheet.shadow,
                    }}
                >
                    <FeatherIcon
                        style={{ position: 'absolute', left: 12, top: 12 }}
                        name="calendar"
                        size={20}
                        color={COLORS.primary}
                    />

                    {Platform.OS === 'web' ? (
                        <ReactDatePicker
                            selected={date}
                            onChange={(d) => {
                                setDate(d);
                            }}
                            portalId="root-portal" // This is crucial for Web
                            calendarClassName="custom-calendar-z" // Optional class hook
                            dateFormat="MMMM d, yyyy"
                            customInput={
                                <TextInput
                                    style={{
                                        ...FONTS.font,
                                        color: colors.title,
                                        paddingLeft: 45,
                                        paddingRight: 6,
                                        height: 46,
                                    }}
                                    value={date.toDateString().slice(4)}
                                    editable={false}
                                />
                            }
                        />
                    ) : (
                        <Ripple onPress={() => {}}>
                            <TextInput
                                style={{
                                    ...FONTS.font,
                                    color: colors.title,
                                    paddingLeft: 45,
                                    paddingRight: 6,
                                    height: 46,
                                }}
                                value={date.toDateString().slice(4)}
                                editable={false}
                            />
                        </Ripple>
                    )}
                </View>
              </View>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <Ripple
            style={[
              styles.tab,
              tab === 'gross' && styles.activeTab,
            ]}
            onPress={() => setTab('gross')}
          >
            <Text
              style={[
                FONTS.fontSm,
                styles.tabText,
                tab === 'gross' && styles.activeTabText,
              ]}
            >
              Gross
            </Text>
          </Ripple>

          <Ripple
            style={[
              styles.tab,
              tab === 'result' && styles.activeTab,
            ]}
            onPress={() => setTab('result')}
          >
            <Text
              style={[
                FONTS.fontSm,
                styles.tabText,
                tab === 'result' && styles.activeTabText,
              ]}
            >
              Result
            </Text>
          </Ripple>
        </View>

        <View  style={{paddingBottom: 100}}>
          {tab === 'gross' && (
            dashData?.resultList && dashData.resultList.length > 0 ? (
              <Animatable.View animation="fadeIn" duration={500}>
                <DrawResult dashData={dashData} />
              </Animatable.View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No gross data available.
                </Text>
              </View>
            )
          )}

          {tab === 'result' && (
            resultData && resultData.length > 0 ? (
              <Animatable.View animation="fadeIn" duration={500}>
                {Object.entries(
                  resultData.reduce((acc: any, item) => {
                    if (!acc[item.categoryGroup]) {
                      acc[item.categoryGroup] = [];
                    }
                    acc[item.categoryGroup].push(item);
                    return acc;
                  }, {})
                ).map(([group, items]: any, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.resultCard,
                      {
                        backgroundColor: colors.card,
                        ...GlobalStyleSheet.shadow
                      },
                    ]}
                  >

                    <View
                      style={[
                        styles.resultHeader,
                        {
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border || COLORS.darkBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.resultHeaderText,
                          { color: COLORS.primary },
                        ]}
                      >
                        {group} {date.toISOString().split('T')[0]}
                      </Text>

                      <Text
                        style={[
                          styles.betEnded,
                          { color: colors.text },
                        ]}
                      >
                        {items[0]?.dateEnded || ''}
                      </Text>
                    </View>

                    {/* BODY */}
                    <View
                      style={[
                        styles.resultBody
                      ]}
                    >
                      {items.map((item: ResultItem, idx: number) => (
                        <View key={idx} style={styles.resultRow}>

                          {/* Category Bubble */}
                          <View
                            style={[
                              styles.categoryCircle,
                              { backgroundColor: COLORS.darkBorder },
                            ]}
                          >
                            <Text
                              style={[
                                styles.categoryText,
                                { color: COLORS.primary },
                              ]}
                            >
                              {item.drawCategory}
                            </Text>
                          </View>

                          {/* Numbers */}
                          <View style={styles.numberContainer}>
                            {(() => {
                              let ballsPerCategory: Record<string, number> = {
                                S2: 1,
                                S3: 1,
                                L2: 1,
                                L3: 1,
                                '4D': 1,
                                EZ2: 2,
                                P3: 2,
                              };

                              const balls = ballsPerCategory[item.drawCategory] || item.combination.length;
                              const numbers = item.combination.match(new RegExp(`.{1,${balls}}`, 'g')) || [];

                              return numbers.map((group, i) => (
                                <View
                                  key={i}
                                  style={[
                                    styles.numberBall,
                                    { backgroundColor: getNumberColor(i) },
                                  ]}
                                >
                                  <Text style={styles.numberText}>{group}</Text>
                                </View>
                              ));
                            })()}
                          </View>

                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </Animatable.View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No result data available.
                </Text>
              </View>
            )
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <SuccessModal
            message={modalMessage}
            isSuccess={isSuccess}
            onClose={() => setModalVisible(false)}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
  },
  dateInput: {
    paddingLeft: 45,
    height: 46,
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    margin: 12,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.darkBorder,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: SIZES.radius,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: '#555',
  },
  activeTabText: {
    color: COLORS.white,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
    datePickerWrapper: {
        flex: 1,
        ...Platform.select({
            web: {
                zIndex: 9999,
                position: 'relative',
            },
        }),
    },
    resultCard: {
      marginHorizontal: 12,
      marginBottom: 18,
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 4,
    },

    resultHeader: {
      paddingVertical: 10,
      alignItems: 'center',
    },

    resultHeaderText: {
      fontSize: 20,
      fontWeight: 'bold',
    },

    betEnded: {
      fontSize: 13,
      marginTop: 4,
    },

    resultBody: {
      padding: 15,
    },

    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },

    categoryCircle: {
      width: 45,
      height: 45,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 20,
      marginBottom: 10,
    },

    categoryText: {
      fontWeight: 'bold',
      fontSize: 17,
    },

    numberContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      maxWidth: '80%',
    },

    numberBall: {
      width: 30,
      height: 30,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
      marginBottom: 10,
    },

    numberText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 15,
    },
});

export default Home;
