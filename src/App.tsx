import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CssBaseline from "@mui/material/CssBaseline";
import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { useEffect, useReducer, useRef, useState } from "react";
import * as browser from "webextension-polyfill";
import argon2 from "argon2-browser";
import AcctCreate from "./AcctCreate";
import Login from "./Login";
import ViewLinks from "./ViewLinks";
import CryptoJS from "crypto-js";
import LoadingButton from "@mui/lab/LoadingButton";
import * as constants from "./constants";
import Modal from "@mui/material/Modal";

declare var __IN_DEBUG__: boolean;
declare var __DEBUG_LIST__: LinkLockerLinkDir;
declare var __VERSION__: string;

type ConfigReducerAction = 
    | {
        type: "newConfig";
        payload: {
            newConfig: LinkLockerConfig;
        }
    }
    | {
        type: "newAcct";
        payload: {
            newAcct: LinkLockerAcct;
        }
    }
    | {
        type: "newCipher";
        payload: {
            guid: string;
            newCipher: LinkLockerCipherParams;
        }
    }
    | {
        type: "removeAcct";
        payload: {
            guid: string;
        }
    }
    | {
        type: "dismissIncognitoWarning";
    }

type ActiveAccountReducerAction = 
    | {
        type: "updateLinks";
        payload: {
            newLinkDir: LinkLockerLinkDir;
        }
    }
    | {
        type: "login";
        payload: LinkLockerActiveAccount;
    }

interface LinkLockerConfig {
    incognitoWarningDismissed: boolean,
    accounts: Array<LinkLockerAcct>,
}

interface LinkLockerAcct {
    username?: string;   
    guid: string;
    authSalt:string;
    authHash: string;
    cipher?: LinkLockerCipherParams;
    cipherSalt: string;
}

interface LinkLockerCipherParams {
    ct: string;
    iv?: string;
    s?: string;
};

export interface LinkLockerLink {
    guid: string;
    href: string;
    name: string;
    timestamp: number;
    tags: Array<string>;
}

export interface LinkLockerLinkDir {
    hosts: Map<string, LinkLockerLinkHost>,
    listCache?: LinkLockerLink[]
} 

export type LinkLockerLinkHost = {
    hostname: string;
    favicon: string;
    tags?: Array<string>;
    links: Array<LinkLockerLink>;
}

export type LinkLockerActiveAccount = {
    guid: string;
    cipherHash: string;
    linkList: LinkLockerLinkDir | null;
}

//Define the possible states for the four possible rendered components
// const ORenderedComponent = {
const RenderedComponent = {
    Loading: 0,
    Login: 1,
    AcctCreate: 2,
    ViewLinks: 3,
}

// type RenderedComponent = typeof ORenderedComponent[keyof typeof ORenderedComponent];

//Set default theme to dark
export const darkTheme = createTheme({
    palette: {
        mode: constants.PALETTE_MODE,
    },
});

export const buildDirCache = (dir: LinkLockerLinkDir) => {
    for (let v of dir.hosts.values()) {
        if (dir.listCache) {
            dir.listCache = dir.listCache.concat(v.links);
        } else {
            dir.listCache = new Array();
        }
    }

}

//Returns a random string of characters [A-Za-z0-9] of specified length
const makeSalt = (length: number): string => {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;

    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
}

export const JsonReplacer = (key: any, value: any) => {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()),
        };
    } else {
        return value;
    }
}

export const JsonReviver = (key: any, value: any) => {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}

//Return an array of account guid/username tuples
const getAcctList = (config: LinkLockerConfig): [string,string][] => {
    if (config) {
        return config.accounts.map((acct) => {
            return [acct.guid, acct.username ? acct.username : ''];
        });
    } else {
        return [];
    }
}

const App = () => {

    const [isLoading, setIsLoading] = useState(true);

    //State reducer for activeAccount. An empty guid is taken to mean that there is no user logged in.
    //links added and removed from the ViewLinks component are contemporaneously stored in activeAccount.linkList
    const activeAccountReducer = (activeAccount: LinkLockerActiveAccount, action: ActiveAccountReducerAction): any => {
        if (action.type === "updateLinks") {
            return {...activeAccount, linkList: action.payload.newLinkDir};
        } else if (action.type === "login") {
            return {guid: action.payload.guid, cipherHash: action.payload.cipherHash, linkList: action.payload.linkList} as LinkLockerActiveAccount;
        }
    }

    //State reducer for the primary configuration. config is stored in extension local storage on every change
    // activeAccount.linkList is reencrypted and stored in config.accounts[/guid/].cipher every update. 
    // Those values are not backpropagated, so this may cause incognito and non-incognito instances of LinkLocker to desync with undefined behavior
    const configReducer = (config: LinkLockerConfig, action: ConfigReducerAction): LinkLockerConfig => {
        let updatedAcctList = Array.from(config.accounts);
        switch (action.type) {
            case "newConfig":
                browser.storage.local.set({ 'config': JSON.stringify(action.payload.newConfig, JsonReplacer) });
                setIsLoading(false);
                return action.payload.newConfig;
            case "newAcct":
                updatedAcctList.push(action.payload.newAcct);
                browser.storage.local.set({ 'config': JSON.stringify({...config, accounts: updatedAcctList}, JsonReplacer) });
                return {...config, accounts: updatedAcctList};
            case "newCipher":
                updatedAcctList.find((v: any, i) => {
                    if (v.guid == action.payload.guid) { v.cipher = action.payload.newCipher; return true; }
                }) 
                browser.storage.local.set({ 'config': JSON.stringify({...config, accounts: updatedAcctList}, JsonReplacer) });
                return {...config, accounts: updatedAcctList};
            case "dismissIncognitoWarning":
                browser.storage.local.set({ 'config': JSON.stringify({...config, incognitoWarningDismissed: true}, JsonReplacer) });
                return {...config, incognitoWarningDismissed: true};
            case "removeAcct":
                updatedAcctList.splice(updatedAcctList.findIndex((a: LinkLockerAcct) => {if (a.guid == action.payload.guid) return}), 1);
                browser.storage.local.set({ 'config': JSON.stringify({...config, accounts: updatedAcctList}, JsonReplacer) });
                return {...config, accounts: updatedAcctList};
        }
    }

    //Set warning as dismissed so modal doesn't get rendered before config load. Value is set to false 
    // in empty config in getConfigsFromStorage function should the storedConfig actually be empty.
    const [config, configDispatch] = useReducer(configReducer, {incognitoWarningDismissed: true, accounts: new Array()}); 
    const [renderedComponent, updateRenderedComponent] = useState(RenderedComponent.Loading);
    const [activeAccount, activeAccountDispatch] = useReducer(activeAccountReducer, {guid: "", cipherHash: "", links: null});
    //Global state that the last login failed. Used by Login component to put the passwordInput into fail style.
    const [failedLogin, updateFailedLogin] = useState(false);
    const [addingNewAcct, updateAddingNewAcct] = useState(false);
    const [incognitoModalOpen, setIncognitoModalOpen] = useState(false);

    //Interface and ref for CreateAcct that allows the app to focus the password field once the modal has been dismissed
    interface AcctCreateHandles {
        focusUsernameField(): void;
    }
    const acctCreateRef = useRef<AcctCreateHandles>(null);

    const getAcct = (guid: string): LinkLockerAcct => {
        let userAcct = config.accounts.find((acct: any) => { if (acct.guid == guid) return acct;});
        if (userAcct == undefined) Error(`Could not find guid ${guid} in account list`);
        return userAcct!;
    }

    const addAcct = (username: string, password: string, guid: string) => {
        if (!getAcct(guid)) {
            //Define async function to hash the password with the account's authSalt to create the first argon2 hash.
            const computeHashes = async (authSalt: string, password: string)  =>  {
                let {encoded: authHash} = await argon2.hash({
                    pass: password,
                    salt: authSalt,
                    type: argon2.ArgonType.Argon2id
                });

                return authHash;
            }       

            //Generate both salts
            let authSalt = makeSalt(constants.SALT_LENGTH);
            let cypherSalt = makeSalt(constants.SALT_LENGTH);

            //Execute async function
            computeHashes(authSalt, password).then((authHash) => {
                let newAcct: LinkLockerAcct = {
                    username: username,
                    guid: guid,
                    authSalt: authSalt,
                    authHash: authHash,
                    cipherSalt: cypherSalt,
                }
                configDispatch({type: "newAcct", payload: {newAcct: newAcct}});
                updateAddingNewAcct(false);
            });
        } else {
            new Error("Attempted to create an account with a duplicate GUID. App has entered an invalid state or something astronomically unlikely has happened. Please consult developer or statistician as appropriate.");
        }
    }

    const tryLogin = (guid: string, password: string) => {
        let userAcct = getAcct(guid);

        //Only continue if the guid exists in the user list. (This should never happen)
        if (userAcct == undefined) {
            updateFailedLogin(true);
            return;
        }

        if (userAcct) {
            //Verify password against the hash. NOTE: userAcct.authHash is a full MCF string that already contains the salt
            argon2.verify({pass: password, encoded: userAcct.authHash}).then((res) => {
                //Ensure that a previous failed login is no longer error-styling the password input
                updateFailedLogin(false);
                //Use argon2 to generate the key (config.account[guid].cipherHash) for AES encryption/decryption of linkList
                argon2.hash({pass: password, salt: userAcct.cipherSalt, type: argon2.ArgonType.Argon2id}).then((res) => {
                    let linkList: LinkLockerLinkDir | null;
                    try {
                        let plainText;
                        //If cipher already exists in config.account[/guid/], load the string and decrypt it with the generated key
                        if(userAcct.cipher) {
                            //Create a new CryptoJS CipherParams based on the saved ct, iv, and salt from config.accounts[guid].cipher
                            let CP = CryptoJS.lib.CipherParams.create({ciphertext: CryptoJS.enc.Base64.parse(userAcct.cipher.ct)});
                            if (userAcct.cipher.iv) { CP.iv = CryptoJS.enc.Hex.parse(userAcct.cipher.iv); }
                            if (userAcct.cipher.s) { CP.salt = CryptoJS.enc.Hex.parse(userAcct.cipher.s); }
                            plainText = CryptoJS.AES.decrypt(CP, res.encoded).toString(CryptoJS.enc.Utf8);
                            let linkObject = JSON.parse(plainText, JsonReviver);
                            if (linkObject.links) {
                                console.error("Old configuration found. Nulling links.");
                                linkList = null;
                            } else if (linkObject.hosts) {
                                linkList = linkObject as LinkLockerLinkDir;
                            } else {
                                linkList = null;
                            }
                        } else {
                        //Otherwise, null out the value for a brand-spanking-new linkList
                            linkList = null;
                        }
                    } catch (e) {
                        linkList = null;
                    }
                    
                    //Create and set the newActiveAccount. cipherHash is now in memory and security will be compromised until it is cleared
                    let newActiveAccount: LinkLockerActiveAccount = {
                        guid: guid,
                        cipherHash: res.encoded,
                        linkList: linkList
                    };
                    let sessionConfig = JSON.stringify(newActiveAccount, JsonReplacer);
                    browser.runtime.sendMessage({command: "set_active_account", string: sessionConfig});
                    // window.localStorage.setItem("sessionConfig", JSON.stringify(newActiveAccount, JsonReplacer));
                    activeAccountDispatch({type: "login", payload: {guid: newActiveAccount.guid, cipherHash: newActiveAccount.cipherHash, linkList: newActiveAccount.linkList}})
                });
                setIsLoading(false);
            }).catch((err) => {
                //Login failed. Error-style the passwordInput
                updateFailedLogin(true);
            })
        }

    }

    const logout = () => {
        //Delete the active session
        // window.localStorage.removeItem("sessionConfig");
        browser.runtime.sendMessage(null, {command: "logout"})
        activeAccountDispatch({type: "login", payload: {guid: "", cipherHash: "", linkList: null}})
    }

    const deleteAcct = () => {
        configDispatch({type: "removeAcct", payload: {guid: activeAccount.guid}});
        logout();
    }

    const showAcctCreate = () => {
        //Sets the state variable that forces the AcctCreate component to be shown.
        updateAddingNewAcct(true);
    }

    //Update links in the decrypted activeAccount.linkList variable and also the encrypted config.accounts[activeAccount.guid].cipher variable
    const updateLinks = (linkDir: LinkLockerLinkDir) => {
        let acct = getAcct(activeAccount!.guid);
        let newActiveAccountObject: LinkLockerActiveAccount = {guid: activeAccount.guid, cipherHash: activeAccount.cipherHash, linkList: linkDir};
        // window.localStorage.setItem("sessionConfig", JSON.stringify(newActiveAccountObject, JsonReplacer));
        browser.runtime.sendMessage({command: "set_active_account", string: JSON.stringify(newActiveAccountObject, JsonReplacer)});
        let encrypted = CryptoJS.AES.encrypt(JSON.stringify(linkDir, JsonReplacer), newActiveAccountObject.cipherHash);
        //Create serializable LinkLockerBasicCipherParams from the fresh CryptoJS CipherParams
        acct.cipher = {
            ct: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
            iv: encrypted.iv.toString(),
            s: encrypted.salt.toString()
        }
        configDispatch({type: "newCipher", payload: {guid: acct.guid, newCipher: acct.cipher}})
        activeAccountDispatch({type: "updateLinks", payload: {newLinkDir: linkDir}})
    }

    //Async function ran on every popup open to get the "config" key from local extension storage and prime the app state
    async function getConfigsFromStorage() {
        let {config: storedConfigString} = await browser.storage.local.get("config");

        if (storedConfigString) {
            //Try to load config from "config" key
            let loadedConfig: LinkLockerConfig;
            loadedConfig = JSON.parse(storedConfigString, JsonReviver);
            configDispatch({type: "newConfig", payload: {newConfig: loadedConfig}})

            //Try to load session data
            // let sessionConfigString = window.localStorage.getItem('sessionConfig');
            browser.runtime.sendMessage(null, {command: "get_active_account"}).then((payload) => {
                if (payload && payload.string) {
                    let activeAccount = JSON.parse(payload.string, JsonReviver) as LinkLockerActiveAccount;
                    activeAccountDispatch({type: "login", payload: {guid: activeAccount.guid, cipherHash: activeAccount.cipherHash, linkList: activeAccount.linkList}})
                }
            });

            // if (sessionConfigString) {
            //     //Parse session into activeAccount, dispatch, and do nothing else
            //     // let activeAccount = JSON.parse(sessionConfigString, JsonReviver) as LinkLockerActiveAccount;
            //     // activeAccountDispatch({type: "login", payload: {guid: activeAccount.guid, cipherHash: activeAccount.cipherHash, linkList: activeAccount.linkList}})
            //     // return;
            // } else if (loadedConfig.accounts.length > 0) {
            //     // setIsLoading(false);
            //     return;
            // } else {
            //     // setIsLoading(false);
            //     return;
            // }
        } else {
            //First time running the extension
            //Generate new config with empty accounts array and unset the flag to dismiss the non-incognito warning modal
            let newConfig: LinkLockerConfig = {
                incognitoWarningDismissed: false,
                accounts: new Array(),
            };
            configDispatch({type: "newConfig", payload: {newConfig: newConfig}})
            // setIsLoading(false);
            return;
        }
    }

    useEffect(() => {
        getConfigsFromStorage();
    }, []);

    //Set renderedComponent based on current state
    useEffect(() => {
        //Show incognito warning modal if the flag hasn't been set
        if (!browser.extension.inIncognitoContext && !config.incognitoWarningDismissed) {
            setIncognitoModalOpen(true);
        } else {
            setIncognitoModalOpen(false);
            if (renderedComponent == RenderedComponent.AcctCreate) {
                acctCreateRef.current?.focusUsernameField()
            }
        }
        //No config loaded -> Loading
        if (!config || isLoading) {
            updateRenderedComponent(RenderedComponent.Loading);
        }
        //No accounts in account list -> AcctCreate
        if ((getAcctList(config).length < 1 || addingNewAcct) && !isLoading) {
            browser.browserAction.setIcon({
                path: {
                    "48": "icons/LLLockDark48.png",
                    "96": "icons/LLLockDark96.png"
                }
            });
            updateRenderedComponent(RenderedComponent.AcctCreate);
        }
        //No activeAccount and accountList.length>0 -> Login
        if (getAcctList(config).length > 0 && !activeAccount.guid && !addingNewAcct && !isLoading) {
            browser.browserAction.setIcon({
                path: {
                    "48": "icons/LLLockDark48.png",
                    "96": "icons/LLLockDark96.png"
                }
            });
            updateRenderedComponent(RenderedComponent.Login);
        }
        //activeAccount specified -> ViewLinks
        if (activeAccount.guid && !addingNewAcct) {
            browser.browserAction.setIcon({
                path: {
                    "48": "icons/LLUnlockDark48.png",
                    "96": "icons/LLUnlockDark96.png"
                }
            });
            updateRenderedComponent(RenderedComponent.ViewLinks);
        }
    })

    return (
        <>
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <Modal 
                    open={incognitoModalOpen}
                    onClose={(e, r) => {
                        configDispatch({type: "dismissIncognitoWarning"});
                        setIncognitoModalOpen(false);     
                    }}
                    disableAutoFocus={false}
                    sx={{
                        margin: 'auto', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                    }}
                    onKeyDown={(e) => {
                        if (e.key == " " || e.key === "Enter") {
                            e.preventDefault();
                            configDispatch({type: "dismissIncognitoWarning"});
                            setIncognitoModalOpen(false);
                        }
                    }}
                >
                    <Box maxWidth="80%" maxHeight="fit-content" sx={{
                        padding: "10px",
                        bgcolor: 'background.paper',
                        border: '2px solid',
                        borderColor: 'error.main',
                        borderRadius: 1
                        }}>
                        <Typography variant="caption" paragraph={true} sx={{ 
                            lineHeight: "1rem", 
                            cursor: "default",
                            mb: "0px",    
                        }}>
                            WARNING: <br />LinkLocker is intended to be used in incognito mode. When used in non-incognito mode, LinkLocker sessions may persist through browser shutdown. If you use LinkLocker in non-incognito mode, be sure to log out of your session before closing your browser to maintain privacy. Adding links in both modes simultaneously is not recommended and may result in lost entries.
                        </Typography>
                    </Box>
                </Modal>
                <Box 
                    paddingTop="0.8rem" 
                    paddingLeft="0.8rem"
                    paddingRight="0.8rem"
                    paddingBottom={__IN_DEBUG__ ? "0px" : "0.8rem"}
                    margin="auto" 
                    // overflow-y="hidden" 
                    maxWidth={constants.MAIN_MAX_WIDTH} 
                    minWidth={constants.MAIN_MIN_WIDTH}
                    maxHeight="fit-content"
                    boxSizing="border-box"
                >
                    <Stack spacing={1} alignItems="center" key={renderedComponent}> 
                        <Typography variant="h5">
                            LinkLocker
                        </Typography>
                        {
                            browser.extension.inIncognitoContext ?
                            null
                            :
                            <Typography
                                variant="caption" 
                                color="error.main"
                                mt="0px"
                            >Browser is not in icognito mode</Typography>
                        }
                        {/* Conditionally render the three different components and a loading indicator */}
                        {
                            renderedComponent == RenderedComponent.Loading || renderedComponent == null ? 
                            <LoadingButton loading variant="outlined">Loading...</LoadingButton>
                            :
                            null
                        }
                        {
                            renderedComponent == RenderedComponent.AcctCreate ?
                            <AcctCreate addAcct={addAcct} ref={acctCreateRef} />
                            :
                            null
                        }
                        {
                            renderedComponent == RenderedComponent.Login ?
                            <Login failedLogin={failedLogin} tryLogin={tryLogin} availableLogins={getAcctList(config)} showAcctCreate={showAcctCreate}/>
                            :
                            null
                        }
                        {
                            renderedComponent == RenderedComponent.ViewLinks ?
                            <ViewLinks 
                                linkDir={activeAccount ? activeAccount!["linkList"] : null} 
                                updateLinks={updateLinks} 
                                logout={logout} 
                                deleteAcct={deleteAcct} 
                            />
                            :
                            null
                        }
                    </Stack>
                </Box>
                    {
                        __IN_DEBUG__ ?
                        <Stack width="100%" flexDirection="row" justifyContent="right">
                            <Typography variant="caption" marginRight="0.25rem" color="secondary.main">LinkLocker Debug v{__VERSION__}</Typography>
                        </Stack>
                        :
                        null
                    }
            </ThemeProvider>
        </>
    );
};

export default App;