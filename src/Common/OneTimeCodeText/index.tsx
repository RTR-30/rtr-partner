import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';

export const CELL_SIZE = 40;
export const CELL_BORDER_RADIUS = 12;
export const DEFAULT_CELL_BG_COLOR = '#fff';
export const ACTIVE_CELL_BG_COLOR = '#ead4fa';
export const NOT_EMPTY_CELL_BG_COLOR = '#9400FF';


export type OneTimeCodeTextComponentProps = {
    value: string;
    cellCount?: any;
    onChangeText: (value: string) => void;
};

const OneTimeCodeTextComponent: React.FC<OneTimeCodeTextComponentProps> = ({ value, onChangeText, cellCount }) => {
    const CELL_COUNT = cellCount ? cellCount : 6;
    const { Value, Text: AnimatedText } = Animated;
    const animationsColor = [...new Array(CELL_COUNT)].map(() => new Value(0));
    const animationsScale = [...new Array(CELL_COUNT)].map(() => new Value(1));
    const animateCell = ({ hasValue, index, isFocused }:any) => {
        Animated.parallel([
            Animated.timing(animationsColor[index], {
                useNativeDriver: false,
                toValue: isFocused ? 1 : 0,
                duration: 250,
            }),
            Animated.spring(animationsScale[index], {
                useNativeDriver: false,
                toValue: hasValue ? 0 : 1,
                duration: hasValue ? 300 : 250,
            }),
        ]).start();
    };

    const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue: onChangeText,
    });

    const renderCell = ({ index, symbol, isFocused }:any) => {
        const hasValue = Boolean(symbol);
        const animatedCellStyle = {
            backgroundColor: hasValue
                ? animationsScale[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [NOT_EMPTY_CELL_BG_COLOR, ACTIVE_CELL_BG_COLOR],
                })
                : animationsColor[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [DEFAULT_CELL_BG_COLOR, ACTIVE_CELL_BG_COLOR],
                }),
            borderRadius: animationsScale[index].interpolate({
                inputRange: [0, 1],
                outputRange: [CELL_SIZE, CELL_BORDER_RADIUS],
            }),
            transform: [
                {
                    scale: animationsScale[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.2, 1],
                    }),
                },
            ],
        };

        // Run animation on next event loop tik
        // Because we need first return new style prop and then animate this value
        setTimeout(() => {
            animateCell({ hasValue, index, isFocused });
        }, 0);

        return (
            <AnimatedText
                key={index}
                style={[styles.cell, animatedCellStyle]}
                onLayout={getCellOnLayoutHandler(index)}>
                {symbol || (isFocused ? <Cursor /> : null)}
            </AnimatedText>
        );
    };

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <CodeField
                ref={ref}
                {...props}
                value={value}
                returnKeyType='done'
                cellCount={CELL_COUNT}
                renderCell={renderCell}
                keyboardType="number-pad"
                onChangeText={onChangeText}
                textContentType="oneTimeCode"
                rootStyle={styles.codeFieldRoot}
            />
        </View>
    );
};

export default OneTimeCodeTextComponent;

const styles = StyleSheet.create({
    codeFieldRoot: {
        height: CELL_SIZE,
        marginTop: 30,
        paddingHorizontal: 20,
        justifyContent: 'center',

    },
    cell: {
        marginHorizontal: 8,
        height: CELL_SIZE,
        width: CELL_SIZE,
        lineHeight: CELL_SIZE - 5,
        fontSize: 30,
        textAlign: 'center',
        borderRadius: CELL_BORDER_RADIUS,
        color: '#9400FF',
        backgroundColor: '#fff',
// borderColor: '#000',
// borderWidth: 1,
        // IOS
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,

        // Android
        elevation: 3,
    },

    // =======================

    root: {
        minHeight: 800,
        padding: 20,
        borderRadius: CELL_BORDER_RADIUS,
    },

    title: {
        paddingTop: 50,
        color: '#000',
        fontSize: 25,
        fontWeight: '700',
        textAlign: 'center',
        paddingBottom: 40,
        borderRadius: CELL_BORDER_RADIUS,
    },
    icon: {
        width: 217 / 2.4,
        height: 158 / 2.4,
        marginLeft: 'auto',
        marginRight: 'auto',
        borderRadius: CELL_BORDER_RADIUS,
    },
    subTitle: {
        paddingTop: 30,
        color: '#000',
        textAlign: 'center',
    },
    nextButton: {
        marginTop: 30,
        borderRadius: 60,
        height: 60,
        backgroundColor: '#3557b7',
        justifyContent: 'center',
        minWidth: 300,
        marginBottom: 100,
    },
    nextButtonText: {
        textAlign: 'center',
        fontSize: 20,
        color: '#fff',
        fontWeight: '700',
    },
});
