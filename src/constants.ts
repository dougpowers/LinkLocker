declare var __IN_DEBUG__: boolean;

export const MAX_NUM_TAB_OPENS = 5;
export const LOGIN_DISPLAY_NAME_LENGTH = 29;
export const VIEW_LINKS_CHARACTER_LIMIT = 50;
export const SALT_LENGTH = 10;
export const MAIN_MIN_WIDTH = '310px';
export const MAIN_MAX_WIDTH = '420px';
export const INNER_MIN_WIDTH = '350px';
export const INNER_MAX_WIDTH = '350px';
export const INNER_MIN_HEIGHT = '240px';
export const LINK_ENTRY_MAX_WIDTH = '21rem';

let scrollerHeight: string;
if (__IN_DEBUG__) {
    scrollerHeight = "390px"
} else {
    scrollerHeight = "410px"
}
export const SCROLLER_MAX_HEIGHT = scrollerHeight;
export const PALETTE_MODE = 'dark';
export const ENTRY_SCROLL_INCREMENT = 3;
export const ENTRY_SCROLL_INTERVAL = 20;
export const ENTRY_SCROLL_DELAY = 40;
export const ASSUMED_LINK_BUTTON_BAR_WIDTH = 30;

export const FAVICON_WIDTH = 16;
export const FAVICON_HEIGHT = 16;