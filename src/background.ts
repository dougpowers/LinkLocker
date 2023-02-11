import * as browser from "webextension-polyfill";

export type LinkLockerMessageCommand = "set_active_account" | "get_active_account" | "logout";
export type LinkLockerResponsePayload = "active_account";

export interface LinkLockerMessage {
    command: LinkLockerMessageCommand,
    string: string,
}

export interface LinkLockerResponse {
    payload: LinkLockerResponsePayload,
    string: string,
}

const handleMessage = (message: LinkLockerMessage, sender: browser.Runtime.MessageSender) => {
    if (message.command == "set_active_account") {
        window.sessionStorage.setItem("sessionConfig", message.string);
    } else if (message.command == "get_active_account") {
        let active_account = window.sessionStorage.getItem("sessionConfig");
        return Promise.resolve({payload: "active_account", string: active_account});
    } else if (message.command == "logout") {
        window.sessionStorage.removeItem("sessionConfig");
    }
}

browser.runtime.onMessage.addListener(handleMessage);