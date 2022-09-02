import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton"
import Link from "@mui/material/Link"
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import { createRef, ReactNode, useEffect, MouseEvent, useState } from "react";
import * as browser from "webextension-polyfill";
import { LinkLockerLinkList, LinkLockerLink } from "./App";
import { Fab, Menu, MenuItem } from "@mui/material";

type Props = {
    linkList: LinkLockerLinkList | null,
    updateLinks: (linkList: LinkLockerLinkList) => void,
    logout: () => void;
    deleteAcct: () => void;
}

type LinkLockerLinkDir = {
    hosts: Array<LinkLockerLinkHost>;
} 

type LinkLockerLinkHost = {
    hostname: string;
    favicon: string;
    links: Array<LinkLockerPath>;
}

type LinkLockerPath = {
    title: string;
    href: string;
    pathname: string;
    timestamp: number;
}

const ViewLinks = ({linkList, updateLinks, logout, deleteAcct}: Props) => {

    const addLinkButton: any = createRef();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const addLink = () => {
        browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
            if (tabs.at(0) != undefined && tabs.at(0)!.url) {
                let link = {href: tabs.at(0)!.url!, title: tabs.at(0)!.title!, favicon: tabs.at(0)!.favIconUrl!, timestamp: Date.now()};
                if (linkList == null) {
                    linkList = {links: [
                        link
                    ]}
                } else {
                    linkList.links.push(link);
                }
                updateLinks(linkList!);
            } else {
            }
        }).catch((err) => {console.log(err)});
    }

    const handleClick = (e: MouseEvent<HTMLElement>) => {
        setAnchorEl(e.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const removeLink = (link: LinkLockerLink) => {
        //Splice out link (compared using timestamp)
        linkList!.links.splice(linkList!.links!.findIndex((l) => {if (l.timestamp == link.timestamp) {return true;}}), 1);
        updateLinks(linkList!);
    }




    const buildListSorted = (): ReactNode => {
        if(linkList != null && linkList.links.length > 0) {
            let dir: LinkLockerLinkDir = { hosts: new Array() }
            linkList.links.forEach((l) => {
                let url = new URL(l.href);
                // if link isn't found in the hosts dir
                let host = dir.hosts.find((i: LinkLockerLinkHost) => {if (url.hostname == i.hostname) return i;})
                if (!host) {
                    //create dir entry and add link
                    let entry: LinkLockerPath = {title: l.title, href: l.href, pathname: url.pathname, timestamp: l.timestamp}
                    dir.hosts.push({hostname: url.hostname, favicon: l.favicon, links: [entry]})
                } else {
                    //add link to host
                    host.links.push({title: l.title, href: l.href, pathname: url.pathname, timestamp: l.timestamp})
                }
            })
            return ( 
            dir.hosts.map(
            (host, index) => {
                    return (
                        <Stack direction="column" sx={{
                            p: 0.12,
                            m: 0.12
                        }} justifyItems="left" alignItems="left" key={index}>
                            <Stack direction="row" justifyItems="left" sx={{m: 0.12, p: 0.12}} alignItems="center" key={host.hostname}>
                                <img src={host.favicon} width="16px" height="16px" key={host.favicon}></img>
                                <Typography variant="body2" sx={{ml: 0.5}} key={host.hostname.substring(0, 2)}>
                                    {host.hostname}
                                </Typography>
                            </Stack>
                            <Stack direction="column" justifyItems="left" sx={{mt: 0}}alignItems="left" key={JSON.stringify(host.links.at(0)!.timestamp)}>
                            {host.links.map((link) => {
                                return (
                                    <Stack direction="row" justifyItems="left" sx={{m: 0}} alignItems="center" key={link.title+link.timestamp.toString()}>
                                        <Link variant="caption" href={link.href} key={link.href+link.timestamp.toString()} sx={{
                                            pr: 1,
                                            pt: 0.25,
                                            ml: 2,
                                            lineHeight: 1,
                                            overflow: "hidden",
                                        }}>
                                            {link.title}
                                        </Link>
                                        <Box flexGrow={1} />
                                        <IconButton size="small" onClick={() => removeLink({
                                            href: link.href,
                                            favicon: host.favicon,
                                            title: link.title,
                                            timestamp: link.timestamp
                                        })}
                                        sx={{
                                            p: "1px",
                                            m: "1px",
                                            mr: 1.5,
                                            maxWidth: "0px",
                                            maxHeight: "0px"
                                        }}>
                                            <DeleteIcon sx={{fontSize: 16, color: "error.dark" }} />
                                        </IconButton>
                                    </Stack>
                                );
                            })}
                            </Stack>
                        </Stack>
                    );
                }
            )
            )
            ;
        } else {
            return (
                <Typography variant="body2">No links saved.</Typography>
            )
        }
    }

    useEffect(() => {
        addLinkButton.current.focus();
    }, [])

    return (
        <Stack spacing={0} minHeight="200px" minWidth="300px">
                {buildListSorted()}
            <Box flexGrow={1} />
            <Stack spacing={1} sx={{mt: 2}} direction="row" alignItems="center">
                {/* <Button variant="contained" size="small" onClick={logout}>Logout</Button> */}
                <Fab 
                    variant="extended"
                    ref={addLinkButton}
                    onClick={addLink}
                    size="small"
                    color="primary"
                >
                    <AddIcon />
                    <Box sx={{pr: 1}}>
                        Add Link
                    </Box>
                </Fab>
                <Box flexGrow={1} />
                {/* <Button variant="contained" size="small" ref={addLinkButton} onClick={addLink}>Add Link</Button> */}
                <IconButton
                    id="long-button"
                    onClick={handleClick}
                    size="small"
                >
                    <MoreVertIcon />
                </IconButton>
                <Menu
                    id="long-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    PaperProps={{
                        style: {
                            maxHeight: 48 * 4.5,
                            width: "17ch",
                        },
                    }}
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "right"
                    }}
                    transformOrigin={{
                        vertical: "bottom",
                        horizontal: "right"
                    }}
                >
                    <MenuItem key="delete" onClick={deleteAcct} sx={{
                        color: "error.main",
                    }}>Delete Account...</MenuItem>
                    <MenuItem key="logout" onClick={logout}>Logout</MenuItem>
                </Menu>
            </Stack>
        </Stack>
    )
}

export default ViewLinks;