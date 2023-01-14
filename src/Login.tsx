import { SelectChangeEvent } from "@mui/material"
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import { createRef, KeyboardEvent, useEffect, useState } from "react"
import * as constants from "./constants";

type Props = {
    failedLogin: boolean,
    availableLogins: Array<Array<string>>,
    tryLogin: (guid: string, password: string) => void,
    showAcctCreate: () => void;
}


const Login = ({failedLogin, availableLogins, tryLogin, showAcctCreate}: Props) => {
    const usernameSelect: any = createRef();
    const passwordInput: any = createRef();
    const passwordField: any = createRef();
    const submitButton: any = createRef();
    
    //State variable for user list index
    let [user, setUser] = useState(0);

    const handleKeyPress = (e: KeyboardEvent) => {
        if ((e.target as HTMLElement).id == "password" && e.key == "Enter") {
            submitButton.current.focus();
            submitButton.current.click();
        }
    }

    const handleChange = (event: SelectChangeEvent) => {
        setUser(Number(event.target.value));
    }

    const submit = () => {
        tryLogin(availableLogins[user][0], passwordInput.current.value);
    }

    useEffect(() => {
        if (failedLogin) {
            passwordInput.current.focus();
            passwordInput.current.select();
        }
    }, [failedLogin])

    useEffect(() => {
        passwordInput.current.focus();
    }, [])

    return (
            <Box>
                <Stack spacing={1} alignItems="left"> 
                    <FormControl fullWidth>
                        <InputLabel id="username-select-label">Username</InputLabel>
                        <Select
                            labelId="username-select-label"
                            defaultValue={availableLogins[0][0] as string}
                            value={String(user)}
                            label="Username"
                            onChange={handleChange}
                            ref={usernameSelect}
                        >
                            {availableLogins.map((login, index) => {
                                let displayName: string;
                                if (login[1] != '') {
                                    displayName = `${login[1]} (${login[0].substring(0, constants.LOGIN_DISPLAY_NAME_LENGTH - (login[1].length + 6))}...)`;
                                } else {
                                    displayName = `(${login[0].substring(0, constants.LOGIN_DISPLAY_NAME_LENGTH-6)}...)`;
                                }
                                return (
                                    <MenuItem key={index} value={index}>{displayName}</MenuItem>
                                )
                            })}
                        </Select>
                    </FormControl>
                    <TextField inputProps={{type: "password"}} variant="outlined" error={failedLogin} ref={passwordField} inputRef={passwordInput} label="Password" id="password" onKeyPress={(e) => handleKeyPress(e)} />
                    <Stack direction="row" spacing={2}>
                        <Button ref={submitButton} variant="contained" onClick={submit}>Login</Button>
                        <Box flexGrow={1} />
                        <Button variant="contained" onClick={showAcctCreate}>Add Account</Button>
                    </Stack>
                </Stack>
            </Box>
    )
}

export default Login;