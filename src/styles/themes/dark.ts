import { Colors } from '../common';

export default {
    fontFamily: {
        primary: "'Karla' !important",
        secondary: "'Montserrat' !important",
    },
    background: {
        primary: Colors.BLACK,
        secondary: Colors.PURPLE,
        tertiary: Colors.GRAY,
    },
    textColor: {
        primary: Colors.PURPLE,
        secondary: Colors.WHITE,
        tertiary: Colors.GREEN,
    },
    borderColor: {
        primary: Colors.PURPLE,
        secondary: `linear-gradient(90deg, ${Colors.PURPLE_DARK} 0%, ${Colors.BLUE} 100%)`,
        tertiary: Colors.GRAY,
    },
    button: {
        background: {
            primary: Colors.BLACK,
            secondary: Colors.PURPLE,
            tertiary: Colors.BLUE,
            quaternary: Colors.WHITE,
        },
        textColor: {
            primary: Colors.WHITE,
            secondary: Colors.BLACK,
            tertiary: Colors.PURPLE,
        },
        borderColor: {
            primary: `linear-gradient(90deg, ${Colors.PURPLE_DARK} 0%, ${Colors.BLUE} 100%)`,
            secondary: Colors.PURPLE,
        },
    },
    input: {
        background: {
            primary: Colors.BLACK,
            selection: {
                primary: Colors.WHITE,
            },
        },
        textColor: {
            primary: Colors.PURPLE,
            secondary: Colors.BLACK,
            tertiary: Colors.RED,
        },
        borderColor: {
            primary: Colors.PURPLE,
            focus: {
                primary: Colors.PURPLE,
            },
            error: {
                primary: Colors.RED,
            },
        },
        placeholderColor: {
            primary: Colors.PURPLE_HALF,
        },
    },
    dropDown: {
        background: {
            primary: Colors.BLACK,
            secondary: Colors.PURPLE,
        },
        textColor: {
            primary: Colors.PURPLE,
            secondary: Colors.WHITE,
        },
    },
    link: {
        textColor: {
            primary: Colors.WHITE,
            secondary: Colors.PURPLE,
        },
    },
    icon: {
        background: {
            primary: Colors.BLACK,
            secondary: Colors.PURPLE,
        },
        textColor: {
            primary: Colors.PURPLE,
            secondary: Colors.BLACK,
            tertiary: Colors.WHITE,
            quaternary: `linear-gradient(180deg, ${Colors.PURPLE_DARK_2} 0%, ${Colors.BLUE_DEEP_SKY} 100%)`,
        },
    },
    error: {
        textColor: {
            primary: Colors.RED,
        },
    },
    status: {
        won: Colors.GREEN,
        loss: Colors.RED,
    },
    price: {
        up: Colors.GREEN,
        down: Colors.RED,
    },
    toastMessages: {
        success: {
            background: {
                primary: Colors.GREEN,
                secondary: Colors.GREEN_DARKER,
                tertiary: Colors.GREEN_DARK,
                quaternary: Colors.GREEN_LIGHT,
            },
            textColor: {
                primary: Colors.BLACK,
            },
        },
        info: {
            background: {
                primary: Colors.BLUE,
                secondary: Colors.BLUE_LIGHT,
                tertiary: Colors.BLUE_DARK,
            },
            textColor: {
                primary: Colors.BLACK,
            },
        },
        error: {
            background: {
                primary: Colors.RED,
                secondary: Colors.RED_LIGHT,
                tertiary: Colors.RED_DARK,
            },
            textColor: {
                primary: Colors.BLACK,
            },
        },
    },
    flexCard: {
        background: {
            potential: Colors.GREEN_POTENTIAL,
            won: `linear-gradient(6.97deg, ${Colors.GOLD_1} -2.18%, ${Colors.GOLD_2} 23.54%, ${Colors.GOLD_3} 44.36%, ${Colors.GOLD_4} 65.19%, ${Colors.GOLD_3} 81.11%, ${Colors.GOLD_5} 103.16%, ${Colors.GOLD_3} 120.31%)`,
            loss: Colors.RED,
        },
        textColor: { potential: Colors.GREEN_POTENTIAL, won: Colors.YELLOW_LIGHT, loss: Colors.WHITE + '80' }, // opacity 50%
    },
    chart: {
        candleUp: Colors.GREEN,
        candleDown: Colors.RED,
        labels: Colors.GRAY_BLUE,
        priceLine: Colors.PURPLE,
        multiPositions: Colors.PURPLE,
        area: {
            start: Colors.PURPLE_START,
            end: Colors.PURPLE_END,
        },
    },
};
