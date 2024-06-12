import { Colors } from '../common';

export default {
    fontFamily: {
        primary: "'Karla' !important",
        secondary: "'Montserrat' !important",
    },
    background: {
        primary: Colors.BLACK,
        secondary: Colors.GRAY,
        tertiary: '',
        quaternary: '',
        quinary: Colors.PURPLE,
    },
    textColor: {
        primary: Colors.WHITE,
        secondary: '',
        tertiary: '',
        quaternary: Colors.GREEN,
        quinary: Colors.PURPLE,
    },
    borderColor: {
        primary: Colors.GRAY,
        secondary: '',
        tertiary: `linear-gradient(90deg, ${Colors.PURPLE_DARK} 0%, ${Colors.BLUE} 100%)`,
        quaternary: Colors.PURPLE,
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
            quaternary: '',
        },
        borderColor: {
            primary: `linear-gradient(90deg, ${Colors.PURPLE_DARK} 0%, ${Colors.BLUE} 100%)`,
            secondary: Colors.PURPLE,
            tertiary: '',
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
            primary: Colors.WHITE,
            secondary: Colors.PURPLE,
            tertiary: Colors.BLACK,
            quaternary: Colors.RED,
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
            primary: Colors.WHITE,
            secondary: Colors.PURPLE,
        },
    },
    link: {
        textColor: {
            primary: Colors.PURPLE,
            secondary: Colors.WHITE,
        },
    },
    icon: {
        background: {
            primary: '',
            secondary: Colors.BLACK,
            tertiary: Colors.PURPLE,
        },
        textColor: {
            primary: `linear-gradient(180deg, ${Colors.PURPLE_DARK_2} 0%, ${Colors.BLUE_DEEP_SKY} 100%)`,
            secondary: Colors.BLACK,
            tertiary: Colors.PURPLE,
            quaternary: Colors.WHITE,
        },
    },
    error: {
        textColor: {
            primary: Colors.RED,
        },
        borderColor: {
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
        down: Colors.RED,
        up: Colors.GREEN,
        resolved: Colors.YELLOW_DARK,
        text: Colors.GRAY_BLUE,
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
