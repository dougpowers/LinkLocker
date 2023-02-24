import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { createRef, forwardRef, KeyboardEvent, useEffect, useImperativeHandle, useState } from "react";
import Typography from "@mui/material/Typography";
import {v4 as uuidv4} from 'uuid';
import Modal from "@mui/material/Modal";
import { JsonReviver, LinkLockerAcct } from './App';

type Props = {
    addAcct: (username: string, password: string, guid: string) => void,
    importAcct: (acct: LinkLockerAcct) => void,
}

const AcctCreate = forwardRef((
{addAcct, importAcct}: Props, ref) => {
    const usernameInput: any = createRef();
    const passwordInput: any = createRef();
    const passwordField: any = createRef();
    const submitButton: any = createRef();
    const importAccountInput: any = createRef();
    const importAccountModalImportButton: any = createRef();
    const importButton: any = createRef();
    
    useImperativeHandle(ref, () => ({
        focusUsernameField: () => {
            usernameInput.current.focus();
    },
    }))

    let [guid, setGuid] = useState(uuidv4());
    let [passwordValue, setPasswordValue] = useState('');
    let [errorState, setErrorState] = useState(false);
    const [importAccountModalOpen, setImportAccountModalOpen] = useState(false);

    const handleKeyPress = (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).id == "username" && e.key == "Enter") {
            passwordInput.current.focus();
        }
        if ((e.target as HTMLElement).id == "password") {
            passwordValue = passwordInput.current.value;
            setPasswordValue(passwordInput.current.value);
            if (passwordValue.length > 0) setErrorState(false);
            if (e.key == "Enter") {
                submitButton.current.focus();
                submitButton.current.click();
            }
        }
    }

    useEffect(() => {
        usernameInput.current.focus();
    }, [])

    const submit = () => {
        if (passwordValue.length > 0) {
            addAcct(usernameInput.current.value, passwordInput.current.value, guid);
        } else {
            setErrorState(true);
            passwordInput.current.focus();
        }
    }

    return (
            <Box>
                <Stack spacing={2} alignItems="left"> 
                    <Stack spacing={0} alignItems="left">
                        <Typography variant="caption">New User GUID:</Typography>
                        <Typography variant="caption">
                            {guid ? guid : null}
                        </Typography>
                    </Stack>
                    <TextField variant="outlined" inputRef={usernameInput} label="Username (optional)" id="username" onKeyPress={(e) => handleKeyPress(e)}>
                    </TextField>
                    <TextField ref={passwordField} error={errorState} inputProps={{type: "password"}} variant="outlined" inputRef={passwordInput} label="Password *" id="password" onKeyPress={(e) => handleKeyPress(e)}>
                    </TextField>
                    <Stack direction="row">
                        <Button ref={submitButton} size="small" variant="contained" onClick={submit}>Create Account</Button>
                        <Box flexGrow={1} />
                        <Button ref={importButton} size="small" variant="contained"
                        onClick={(e) => {setImportAccountModalOpen(true);}} 
                        >Import</Button>
                    </Stack>
                </Stack>
                <Modal open={importAccountModalOpen}>
                    <Box
                        maxWidth="95%"
                        marginTop="10px"
                        marginLeft="auto"
                        marginRight="auto"
                        maxHeight="fit-content"
                        bgcolor="background.paper"
                        padding="10px"
                        border={1}
                        borderRadius={1}
                        borderColor="primary.main"
                        display="flex"
                        flexDirection="column"
                    >
                        <Stack direction="column">
                            <Typography variant="body1" color="text.primary">
                                Paste text from export file below
                            </Typography>
                            <TextField
                                multiline
                                autoFocus={importAccountModalOpen}
                                inputRef={importAccountInput}
                                onFocus={(e) => {e.currentTarget.select()}}
                                sx={{
                                    height: "100%",
                                    width: "100%"
                                }}
                                size="small"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") importAccountModalImportButton.current.click();
                                }}
                                minRows={9}
                                maxRows={9}
                            />
                        <Stack direction="row">
                            <Button
                                ref={importAccountModalImportButton}
                                onClick={() => {
                                    let acct: LinkLockerAcct = JSON.parse(importAccountInput.current.value, JsonReviver);
                                    importAcct(acct);
                                    setImportAccountModalOpen(false);
                                }} 
                            >
                                Import
                            </Button>
                            <Box flexGrow={1}/>
                            <Button onClick={() => {setImportAccountModalOpen(false);}}>Cancel</Button>
                        </Stack>
                        </Stack>
                    </Box>
                </Modal>
            </Box>
    );
})

export default AcctCreate;