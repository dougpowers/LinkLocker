import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { createRef, forwardRef, KeyboardEvent, useEffect, useImperativeHandle, useState } from "react";
import Typography from "@mui/material/Typography";
import {v4 as uuidv4} from 'uuid';

type Props = {
    addAcct: (username: string, password: string, guid: string) => void,
}

const AcctCreate = forwardRef((
{addAcct}: Props, ref) => {
    let usernameInput: any = createRef();
    let passwordInput: any = createRef();
    let passwordField: any = createRef();
    let submitButton: any = createRef();


    useImperativeHandle(ref, () => ({
        focusUsernameField: () => {
            usernameInput.current.focus();
    },
    }))

    let [guid, setGuid] = useState(uuidv4());
    let [passwordValue, setPasswordValue] = useState('');
    let [errorState, setErrorState] = useState(false);

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
                    <Button ref={submitButton} variant="contained" onClick={submit}>Create Account</Button>
                </Stack>
            </Box>
    );
})

export default AcctCreate;