import { Colors } from '../common';

export default {
    fontFamily: {
        primary: "'Fira Sans' !important",
        secondary: "'Montserrat' !important",
        tertiary: "'Karla' !important",
    },
    background: {
        primary: Colors.BLACK,
        secondary: Colors.GRAY,
        tertiary: Colors.GRAY_LIGHT,
        quaternary: Colors.ORANGE,
        quinary: Colors.PURPLE,
    },
    textColor: {
        primary: Colors.WHITE,
        secondary: Colors.GRAY_LIGHT,
        tertiary: Colors.RED,
        quaternary: Colors.GREEN,
        quinary: Colors.PURPLE,
    },
    borderColor: {
        primary: Colors.GRAY,
        secondary: Colors.GRAY_LIGHT,
        tertiary: '',
        quaternary: Colors.PURPLE,
    },
    button: {
        background: {
            primary: Colors.BLACK,
            secondary: Colors.PURPLE,
            tertiary: Colors.WHITE,
            quaternary: Colors.GRAY_LIGHT,
        },
        textColor: {
            primary: Colors.WHITE,
            secondary: Colors.BLACK,
            tertiary: Colors.PURPLE,
            quaternary: Colors.ORANGE,
        },
        borderColor: {
            primary: `linear-gradient(90deg, ${Colors.PURPLE_DARK} 0%, ${Colors.BLUE_DEEP_SKY} 100%)`,
            secondary: Colors.PURPLE,
            tertiary: Colors.WHITE,
        },
        shadowColor: {
            primary: Colors.PURPLE_DARK,
            secondary: Colors.BLUE_DEEP_SKY,
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
    },
    dropDown: {
        background: {
            primary: Colors.PURPLE,
            secondary: Colors.WHITE,
        },
        textColor: {
            primary: Colors.WHITE,
            secondary: Colors.BLACK,
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
            primary: Colors.WHITE,
            secondary: Colors.BLACK,
            tertiary: Colors.PURPLE,
        },
        textColor: {
            primary: `linear-gradient(180deg, ${Colors.PURPLE_DARK_2} 0%, ${Colors.BLUE_DEEP_SKY_2} 100%)`,
            secondary: Colors.BLACK,
            tertiary: Colors.PURPLE,
        },
    },
    error: {
        background: {
            primary: Colors.GRAY_DARK,
        },
        textColor: {
            primary: Colors.RED,
        },
        borderColor: {
            primary: Colors.RED,
        },
    },
    warning: {
        background: {
            primary: Colors.GRAY_DARK,
            secondary: Colors.GRAY,
        },
        textColor: {
            primary: Colors.ORANGE,
            secondary: Colors.ORANGE_DARK,
        },
        borderColor: {
            primary: Colors.ORANGE,
        },
    },
    info: {
        background: {
            primary: Colors.GRAY_DARK,
        },
        textColor: {
            primary: Colors.BLUE,
            secondary: Colors.BLUE_DARK,
        },
        borderColor: {
            primary: Colors.BLUE,
        },
    },
    table: {
        textColor: {
            primary: Colors.WHITE,
            secondary: Colors.GRAY_DARK,
            tertiary: Colors.ORANGE,
            quaternary: Colors.GREEN,
        },
    },
    positionColor: {
        up: Colors.PURPLE,
        down: Colors.PURPLE,
    },
    toastMessages: {
        success: {
            background: {
                primary: Colors.GREEN,
                secondary: Colors.GREEN_LIGHT,
                tertiary: Colors.GREEN_DARK,
            },
            textColor: {
                primary: Colors.BLACK,
            },
        },
        info: {
            background: {
                primary: Colors.BLUE_DARK,
                secondary: Colors.BLUE_LIGHT,
                tertiary: Colors.BLUE,
            },
            textColor: {
                primary: Colors.BLACK,
            },
        },
        warning: {
            background: {
                primary: Colors.ORANGE,
                secondary: Colors.ORANGE_LIGHT,
                tertiary: Colors.ORANGE_DARK,
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
};
