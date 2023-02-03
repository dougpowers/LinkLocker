import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton"
import Link from "@mui/material/Link"
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LinkIcon from "@mui/icons-material/Link";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import InfoIcon from "@mui/icons-material/Info";
import { createRef, ReactNode, useEffect, MouseEvent, useState } from "react";
import * as browser from "webextension-polyfill";
import * as constants from './constants';
import { LinkLockerLinkDir, LinkLockerLinkHost, LinkLockerLink, JsonReplacer, JsonReviver } from "./App";
import Fab from "@mui/material/Fab";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import InputAdornment from "@mui/material/InputAdornment";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Fuse from "fuse.js";
import {v4 as uuidv4} from 'uuid';
import Popover from "@mui/material/Popover";
import { resourceLimits } from "worker_threads";
import { Z_NO_COMPRESSION } from "zlib";

declare var __IN_DEBUG__: string;
declare var __DEBUG_LIST__: LinkLockerLink[];

type Props = {
    linkDir: LinkLockerLinkDir | null,
    updateLinks: (linkList: LinkLockerLinkDir) => void,
    logout: () => void;
    deleteAcct: () => void;
}

const ViewLinks = ({linkDir: linkDir, updateLinks, logout, deleteAcct}: Props) => {
    
    var entryScrollAmount: number = 0;
    var entryScrollInterval: number;

    const addLinkButton: any = createRef();
    const addLinkNameField: any = createRef();
    const addLinkTagsField: any = createRef();
    const addLinkDialogAddButton: any = createRef();
    const addLinkDialogCancelButton: any = createRef();
    const editLinkNameField: any = createRef();
    const editLinkTagsField: any = createRef();
    const editLinkDialogAddButton: any = createRef();
    const editLinkDialogCancelButton: any = createRef();
    const searchField: any = createRef();
    const [hamburgerAnchorEl, setHamburgerAnchorEl] = useState<null | HTMLElement>(null);
    const hamburgerOpen = Boolean(hamburgerAnchorEl);
    const [popoverAnchorEl, setPopoverAnchorEl] = useState<null | HTMLElement>(null);
    const popoverOpen = Boolean(popoverAnchorEl);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [addLinkDialogOpen, setAddLinkDialogOpen] = useState(false);
    const [editLinkDialogOpen, setEditLinkDialogOpen] = useState(false);
    const [jsonDumpOpen, setJsonDumpOpen] = useState(false);
    const [linkGuid, setLinkGuid] = useState("");
    const [linkFaviconUrl, setLinkFaviconUrl] = useState("");
    const [linkUrl, setLinkUrl] = useState<null | URL>(null);
    const [linkName, setLinkName] = useState("");
    const [linkTags, setLinkTags] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const trimTitle = (title: string, url: URL) => {
        let domains = url.hostname.split(".");
        let domain = "";

        domains.pop();

        while (true) {
            if (domains.length == 0) {
                break;
            }
            let topDomain: string = domains.pop() as string;
            if (topDomain?.length > 2) {
                domain = topDomain;
                break;
            }
        }

        if (domain) {
            let regex = new RegExp(`(.*)( \\| | - )[^|\\-]*(${domain})[^|\\-]*$`, "i");
            let matches = title.match(regex);
            if (matches) {
                console.debug(matches)
                return matches[1];
            } else {
                return title;
            }
        } else {
            return title;
        }
    }

    const dirFromList = (links: LinkLockerLink[], existingDir: LinkLockerLinkDir): LinkLockerLinkDir => {
        let dir = { hosts: new Map() };
        links.forEach((link, i) => {
            let url = new URL(link.href);

            if (dir.hosts.get(url.hostname)) {
                dir.hosts.get(url.hostname)!.links.push(link);
            } else {
                let favicon = existingDir.hosts.get(url.hostname)?.favicon;
                dir.hosts.set(url.hostname, {hostname: url.hostname, favicon: favicon, links: [link]});
            }
        })

        return dir;
    }

    const setLink = (link: LinkLockerLink) => {
        let url = new URL(link.href);
        let favicon = linkDir?.hosts.get(url.hostname)?.favicon;
        if (favicon) setLinkFaviconUrl(favicon);
        setLinkGuid(link.guid);
        setLinkUrl(new URL(link.href));
        setLinkName(link.name);
        if (link.tags.length > 0) {
            setLinkTags(link.tags.join(" "));
        } else {
            setLinkTags("");
        }
    }    

    const openAddLinkDialog = () => {
        browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
            console.debug(tabs.at(0));
            setLinkFaviconUrl(tabs.at(0)!.favIconUrl!);
            let url = new URL(tabs.at(0)!.url!);
            setLinkUrl(url);
            setLinkName(trimTitle(tabs.at(0)!.title!, url));
            setLinkTags("");
            setAddLinkDialogOpen(true);
        }).catch((err) => {console.debug(err)});
    }    

    const openEditLinkDialog = (link: LinkLockerLink) => {
        let url = new URL(link.href);
        let favicon = linkDir?.hosts.get(url.hostname)?.favicon;
        if (favicon) setLinkFaviconUrl(favicon);

        setLinkGuid(link.guid);
        setLinkUrl(new URL(link.href));
        setLinkName(link.name);
        if (link.tags.length > 0) {
            setLinkTags(link.tags.join(" "))
        } else {
            setLinkTags("");
        }
        setEditLinkDialogOpen(true);
    }

    const addLink = (href: URL, name: string, favicon: string, tags: string[]) => {
        console.debug(`Adding link with keywords ${JSON.stringify(tags)}`)
        browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
            if (tabs.at(0) != undefined && tabs.at(0)!.url) {
                let link = {
                    guid: uuidv4(),
                    href: href.toString(),
                    name: name,
                    timestamp: Date.now(),
                    tags: tags,
                }
                let url = new URL(link.href);

                if (linkDir == null) {
                    // linkDir = {links: [
                    //     link
                    // ]}
                    linkDir = {hosts: new Map()};
                    linkDir.hosts.set(url.hostname, {hostname: url.hostname, favicon: favicon, links: [link]});
                } else {
                    if (linkDir.hosts.get(url.hostname)) {
                        linkDir.hosts.get(url.hostname)!.links.push(link);
                    } else {
                        linkDir.hosts.set(url.hostname, {hostname: url.hostname, favicon: favicon, links: [link]});
                    }
                }
                console.debug("Dispatching updateLinks");
                console.debug(linkDir);
                updateLinks(linkDir!);
            } else {
            }
        }).catch((err) => {console.debug(err)});
    }

    const editLink = (guid: string, url: URL, name: string, favicon: string, tags: [string]) => {
        linkDir!.hosts.get(url.hostname)!.links.forEach((link, i) => {
            if (link.guid == guid) {
                link.href = url.toString();
                link.name = name;
                link.tags = tags;
                return;
            }
        });
        updateLinks(linkDir!);
    }

    const handleHamburgerClick = (e: MouseEvent<HTMLElement>) => {
        setHamburgerAnchorEl(e.currentTarget);
    };
    const handleHamburgerClose = () => {
        setHamburgerAnchorEl(null);
    };

    const handleDialogClose = () => {

    }

    const removeLink = (link: LinkLockerLink) => {
        //Splice out link (compared using timestamp)
        let host = linkDir!.hosts.get(new URL(link.href).hostname)!;
        host.links.splice(host.links.findIndex((l) => {if (l.guid == link.guid) {return true;}}), 1);
        if (host.links.length == 0) {linkDir!.hosts.delete(host.hostname);}
        // linkDir!.links.splice(linkDir!.links!.findIndex((l) => {if (l.guid == guid) {return true;}}), 1);
        updateLinks(linkDir!);
    }

    const buildListSorted = (): ReactNode => {

        const renderGroupByHost = (linkDir: LinkLockerLinkDir, sort?: boolean) => {
            let hosts = Array.from(linkDir.hosts.values());
            if (sort) {
                hosts.sort((a,b) => {
                    let domainsA: string[] = a.hostname.split(".");
                    let domainsB: string[] = b.hostname.split(".");
                    domainsA.pop();
                    domainsB.pop();
                    let sortA: string;
                    let sortB: string;
                    while (true) {
                        if (domainsA.length == 1) {
                            sortA = domainsA.at(0) as string;
                            break;
                        }
                        let domain = domainsA.pop() as string;
                        if (domain.length > 2) {
                            sortA = domain;
                            break;
                        }
                    }
                    while (true) {
                        if (domainsB.length == 1) {
                            sortB = domainsB.at(0) as string;
                            break;
                        }
                        let domain = domainsB.pop() as string;
                        if (domain.length > 2) {
                            sortB = domain;
                            break;
                        }
                    }
                    return sortA.localeCompare(sortB);
                });
            }
            return (hosts.map((host, index) => {
                    return (
                        <Stack direction="column" sx={{
                            p: 0.12,
                            m: 0.12
                        }} justifyItems="left" alignItems="left" key={index}>
                            <Stack direction="row" justifyItems="left" sx={{m: 0.12, p: 0.12}} alignItems="center" key={host.hostname}>
                                {
                                    host.favicon ?
                                    <img src={host.favicon} width="16px" height="16px" key={host.favicon}></img>
                                    :
                                    <LinkIcon sx={{
                                        fontSize: 16,
                                        color: "common.white"
                                    }}/>
                                }
                                <Typography variant="body2" sx={{ml: 0.5}} key={host.hostname.substring(0, 2)}>
                                    {host.hostname}
                                </Typography>
                            </Stack>
                            <Stack direction="column" justifyItems="left" sx={{mt: 0}} alignItems="left" key={JSON.stringify(host.links.at(0)!.timestamp)}>
                            {host.links.map((link) => {
                                return (
                                    <Stack 
                                        direction="row" 
                                        justifyItems="left" 
                                        maxWidth={constants.LINK_ENTRY_MAX_WIDTH}
                                        sx={{m: 0}} 
                                        alignItems="center" 
                                        key={link.name+link.timestamp.toString()}
                                        onMouseOver={function (e) {
                                            (Array.from(e.currentTarget.querySelectorAll("button")) as HTMLButtonElement[]).forEach((v) => {v.style.opacity = "100%";})
                                        }}
                                        onMouseOut={function (e) {
                                            (Array.from(e.currentTarget.querySelectorAll("button")) as HTMLButtonElement[]).forEach((v) => {v.style.opacity = "0%";})
                                        }}
                                    >
                                        <Link 
                                            variant="caption" 
                                            href={link.href} 
                                            key={link.href+link.timestamp.toString()} 
                                            onMouseEnter={(e) => {
                                                var target = e.currentTarget;
                                                var scrollMax = target.scrollWidth - target.offsetWidth;

                                                if (scrollMax > 0) {
                                                    console.debug("Scrolling entry...");
                                                    window.clearInterval(entryScrollInterval);
                                                    entryScrollInterval = window.setInterval(() => {
                                                        if (entryScrollAmount < constants.ENTRY_SCROLL_DELAY) {
                                                            entryScrollAmount += constants.ENTRY_SCROLL_INCREMENT
                                                        } else if (entryScrollAmount < (scrollMax + constants.ENTRY_SCROLL_DELAY)) {
                                                            target.scrollLeft = entryScrollAmount;
                                                            entryScrollAmount += constants.ENTRY_SCROLL_INCREMENT;
                                                        } else {
                                                            target.scrollLeft = entryScrollAmount;
                                                            window.clearInterval(entryScrollInterval);
                                                        }
                                                    }, constants.ENTRY_SCROLL_INTERVAL);
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                entryScrollAmount = 0;
                                                e.currentTarget.scrollLeft = 0;
                                                window.clearInterval(entryScrollInterval)
                                            }}
                                            sx={{
                                                pr: 1,
                                                pt: 0.25,
                                                ml: 2,
                                                lineHeight: 1,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                            }}
                                        >
                                            {link.name}
                                        </Link>
                                        <Box flexGrow={1} />
                                        <IconButton size="small" 
                                            onMouseEnter={(e) => {
                                                setLink(link);
                                                setPopoverAnchorEl(e.currentTarget.parentElement);
                                            }}
                                            onMouseLeave={(e) => {
                                                setPopoverAnchorEl(null);
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.opacity = "100%"
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.opacity = "0%"
                                            }}
                                            sx={{
                                                p: "1px",
                                                ml: 1.5,
                                                mr: 1,
                                                maxWidth: "0px",
                                                maxHeight: "0px",
                                                opacity: "0%",
                                            }}
                                        >
                                            <InfoIcon 
                                                sx={{
                                                    fontSize: 16, 
                                                    color: "common.white",
                                                    opacity: "inherit",
                                                }} 
                                            />
                                        </IconButton>
                                        <IconButton size="small" 
                                            onClick={(e) => {
                                                openEditLinkDialog(link);
                                                e.currentTarget.style.opacity = "0%"
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.opacity = "100%"
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.opacity = "0%"
                                            }}
                                            sx={{
                                                p: "1px",
                                                ml: 1,
                                                mr: 1,
                                                maxWidth: "0px",
                                                maxHeight: "0px",
                                                opacity: "0%",
                                            }}
                                        >
                                            <EditIcon 
                                                sx={{
                                                    fontSize: 16, 
                                                    color: "success.dark",
                                                    opacity: "inherit",
                                                }} 
                                            />
                                        </IconButton>
                                        <IconButton size="small" 
                                            onClick={() => removeLink(link)}
                                            onFocus={(e) => {
                                                e.currentTarget.style.opacity = "100%"
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.opacity = "0%"
                                            }}
                                            sx={{
                                                p: "1px",
                                                ml: 1,
                                                mr: 1,
                                                maxWidth: "0px",
                                                maxHeight: "0px",
                                                opacity: "0%",
                                            }}
                                        >
                                            <DeleteIcon 
                                                sx={{
                                                    fontSize: 16, 
                                                    color: "error.dark",
                                                    opacity: "inherit",
                                                }} 
                                            />
                                        </IconButton>
                                    </Stack>
                                );
                            })}
                            </Stack>
                        </Stack>
                    );
                }
            ));
        }

        const renderFlat = (linkDir: LinkLockerLinkDir) => {
            let links: Array<LinkLockerLink> = new Array();
            linkDir.hosts.forEach((v, k) => {
                links = links.concat(v.links);
            })

            return (links.map((link, i) => {
                let favicon = linkDir.hosts.get(new URL(link.href).hostname)?.favicon;
                return (
                <Stack 
                    direction="row" 
                    justifyItems="left" 
                    maxWidth={constants.LINK_ENTRY_MAX_WIDTH}
                    sx={{mt: "2px"}} 
                    alignItems="center" 
                    key={link.name+link.timestamp.toString()}
                    onMouseOver={function (e) {
                        (Array.from(e.currentTarget.querySelectorAll("button")) as HTMLButtonElement[]).forEach((v) => {v.style.opacity = "100%";})
                    }}
                    onMouseOut={function (e) {
                        (Array.from(e.currentTarget.querySelectorAll("button")) as HTMLButtonElement[]).forEach((v) => {v.style.opacity = "0%";})
                    }}
                >
                    {
                        favicon ?
                        <img src={favicon} width="16px" height="16px" key={favicon}></img>
                        :
                        <LinkIcon sx={{
                            fontSize: 16,
                            color: "common.white"
                        }}/>
                    }
                    <Link 
                        variant="caption" 
                        href={link.href} 
                        key={link.href+link.timestamp.toString()} 
                        onMouseEnter={(e) => {
                            var target = e.currentTarget;
                            var scrollMax = target.scrollWidth - target.offsetWidth;

                            if (scrollMax > 0) {
                                console.debug("Scrolling entry...");
                                window.clearInterval(entryScrollInterval);
                                entryScrollInterval = window.setInterval(() => {
                                    if (entryScrollAmount < constants.ENTRY_SCROLL_DELAY) {
                                        entryScrollAmount += constants.ENTRY_SCROLL_INCREMENT
                                    } else if (entryScrollAmount < (scrollMax + constants.ENTRY_SCROLL_DELAY)) {
                                        target.scrollLeft = entryScrollAmount;
                                        entryScrollAmount += constants.ENTRY_SCROLL_INCREMENT;
                                    } else {
                                        target.scrollLeft = entryScrollAmount;
                                        window.clearInterval(entryScrollInterval);
                                    }
                                }, constants.ENTRY_SCROLL_INTERVAL);
                            }
                        }}
                        onMouseLeave={(e) => {
                            entryScrollAmount = 0;
                            e.currentTarget.scrollLeft = 0;
                            window.clearInterval(entryScrollInterval)
                        }}
                        sx={{
                            pr: 1,
                            pt: 0.25,
                            ml: 2,
                            lineHeight: 1,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                    }}>
                        {link.name}
                    </Link>
                    <Box flexGrow={1} />
                    <IconButton size="small" 
                        onMouseEnter={(e) => {
                            setLink(link);
                            setPopoverAnchorEl(e.currentTarget.parentElement);
                        }}
                        onMouseLeave={(e) => {
                            setPopoverAnchorEl(null);
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.opacity = "100%"
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.opacity = "0%"
                        }}
                        sx={{
                            p: "1px",
                            ml: 1.5,
                            mr: 1,
                            maxWidth: "0px",
                            maxHeight: "0px",
                            opacity: "0%",
                        }}
                    >
                        <InfoIcon 
                            sx={{
                                fontSize: 16, 
                                color: "common.white",
                                opacity: "inherit",
                            }} 
                        />
                    </IconButton>
                    <IconButton size="small" 
                        onClick={(e) => {
                            openEditLinkDialog(link);
                            e.currentTarget.style.opacity = "0%"
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.opacity = "100%"
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.opacity = "0%"
                        }}
                        sx={{
                            p: "1px",
                            ml: 1,
                            mr: 1,
                            maxWidth: "0px",
                            maxHeight: "0px",
                            opacity: "0%",
                        }}
                    >
                        <EditIcon 
                            sx={{
                                fontSize: 16, 
                                color: "success.dark",
                                opacity: "inherit",
                            }} 
                        />
                    </IconButton>
                    <IconButton size="small" 
                        onClick={() => removeLink(link)}
                        onFocus={(e) => {
                            e.currentTarget.style.opacity = "100%"
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.opacity = "0%"
                        }}
                        sx={{
                            p: "1px",
                            ml: 1,
                            mr: 1,
                            maxWidth: "0px",
                            maxHeight: "0px",
                            opacity: "0%",
                        }}
                    >
                        <DeleteIcon 
                            sx={{
                                fontSize: 16, 
                                color: "error.dark",
                                opacity: "inherit",
                            }} 
                        />
                    </IconButton>
                </Stack>
                );
            }));
        }

        console.debug(linkDir);
        if(linkDir != null && linkDir.hosts.size > 0 && searchTerm == "") {
            console.debug("Default - Rendering by host.")
            return renderGroupByHost(linkDir, true);
        } else if (searchTerm != "" && linkDir) {
            let hosts = Array.from(linkDir.hosts.values());
            let links: Array<LinkLockerLink> = new Array();
            hosts.forEach((v, i) => {
                links = links.concat(v.links);
            });

            const fuse = new Fuse(links, {
                keys: [
                    {name: "name", weight: 0.8}, 
                    {name: "href", weight: 0.3}, 
                    {name: "tags", weight: 1},
                ],
                useExtendedSearch: true,
                threshold: 0.4,
            });

            const result = fuse.search(searchTerm);
            if (result.length > 0) {
                return renderFlat(
                    dirFromList(result.map((v,i) => {return v.item;}) as LinkLockerLink[], linkDir)
                );
            } else {
                return (
                    <Typography variant="body2">No results found.</Typography>
                )
            }
        } else if ((linkDir == null || linkDir.hosts.size == 0)) {
            return (
                <Typography variant="body2">No links saved.</Typography>
            )
        }
    }

    useEffect(() => {
        addLinkButton.current.focus();
    }, [])

    return (
        <Box 
            minHeight="100%" 
            boxSizing="border-box"
            onKeyDown={(e) => {
                if (e.key === "s" && document.activeElement?.tagName != "INPUT" && addLinkDialogOpen == false) {
                    e.preventDefault();
                    searchField.current.focus();
                }
            }}
        >
            { __IN_DEBUG__ ?
                <Modal
                    open={jsonDumpOpen}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            setJsonDumpOpen(false);
                        }
                    }}
                >
                    <Box
                        sx={{
                            margin: "1rem",
                            border: "1",
                            borderRadius: "1",
                            borderColor: "primary.main",
                            backgroundColor: "rgba(0,0,0,255)"
                        }}
                    >
                        <TextField
                            multiline
                            onFocus={(e) => {e.currentTarget.select()}}
                            defaultValue={
                                JSON.stringify(linkDir, JsonReplacer)
                            }
                            sx={{
                                height: "100%",
                                width: "100%"
                            }}
                            size="small"
                            maxRows={10}
                        />
                    </Box>
                </Modal>
                :
                null
            }
            <Modal
                open={addLinkDialogOpen}
                disableAutoFocus={true}
                sx={{
                    margin: "auto",
                    maxHeight: "fit-content",
                }}
            >
                <Box
                    maxWidth="80%"
                    marginTop="20px"
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
                    <Typography
                        variant="h6"
                    >
                        Add Link    
                    </Typography> 
                    <Box
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                    >
                        <img src={linkFaviconUrl} width="16px" height="16px" style={{marginRight: "5px"}}/>
                        <Typography
                            variant="caption"
                            marginTop="10px"
                            marginBottom="10px"
                        >
                            {`${linkUrl?.hostname}${linkUrl?.pathname}`}
                        </Typography>
                    </Box>
                    <TextField
                        variant="standard"
                        size="small"
                        label="Name"
                        inputRef={addLinkNameField}
                        autoFocus={addLinkDialogOpen}
                        defaultValue={linkName}
                        onKeyDown={
                            (e) => {
                                if (e.key == "Enter") {
                                    e.preventDefault();
                                    addLinkDialogAddButton.current.click()
                                }
                            }
                        }
                    >
                    </TextField>
                    <TextField
                        variant="standard"
                        size="small"
                        label="Tags"
                        inputRef={addLinkTagsField}
                        placeholder="Space-separated Tags"
                        onKeyDown={
                            (e) => {
                                if (e.key == "Enter") {
                                    e.preventDefault();
                                    addLinkDialogAddButton.current.click()
                                }
                            }
                        }
                    >
                    </TextField>
                    <Stack direction="row" spacing={2} marginTop="10px">
                        <Button 
                        variant="contained" 
                        size="small" 
                        ref={addLinkDialogAddButton} 
                        onClick={() => {
                            setAddLinkDialogOpen(false);
                            addLink(linkUrl as URL, addLinkNameField.current.value, linkFaviconUrl, addLinkTagsField.current.value.split(" "));
                        }}>
                            Add Link
                        </Button>
                        <Box flexGrow={1} />
                        <Button variant="contained" size="small" ref={addLinkDialogCancelButton} onClick={() => {setAddLinkDialogOpen(false)}}>Cancel</Button>
                    </Stack>
                </Box>
            </Modal>
            <Modal
                open={editLinkDialogOpen}
                disableAutoFocus={true}
                sx={{
                    margin: "auto",
                    maxHeight: "fit-content",
                }}
            >
                <Box
                    maxWidth="80%"
                    marginTop="20px"
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
                    <Typography
                        variant="h6"
                    >
                        Edit Link    
                    </Typography> 
                    <Box
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                    >
                        <img src={linkFaviconUrl} width="16px" height="16px" style={{marginRight: "5px"}}/>
                        <Typography
                            variant="caption"
                            marginTop="10px"
                            marginBottom="10px"
                        >
                            {`${linkUrl?.hostname}${linkUrl?.pathname}`}
                        </Typography>
                    </Box>
                    <TextField
                        variant="standard"
                        size="small"
                        label="Name"
                        inputRef={editLinkNameField}
                        autoFocus={editLinkDialogOpen}
                        defaultValue={linkName}
                        onKeyDown={
                            (e) => {
                                if (e.key == "Enter") {
                                    e.preventDefault();
                                    editLinkDialogAddButton.current.click()
                                }
                            }
                        }
                    >
                    </TextField>
                    <TextField
                        variant="standard"
                        size="small"
                        label="Tags"
                        inputRef={editLinkTagsField}
                        defaultValue={linkTags}
                        placeholder="Space-separated Tags"
                        onKeyDown={
                            (e) => {
                                if (e.key == "Enter") {
                                    e.preventDefault();
                                    editLinkDialogAddButton.current.click()
                                }
                            }
                        }
                    >
                    </TextField>
                    <Stack direction="row" spacing={2} marginTop="10px">
                        <Button 
                        variant="contained" 
                        size="small" 
                        ref={editLinkDialogAddButton} 
                        onClick={() => {
                            setEditLinkDialogOpen(false);
                            editLink(linkGuid, linkUrl as URL, editLinkNameField.current.value, linkFaviconUrl, editLinkTagsField.current.value.split(" "));
                        }}>
                            Save Link
                        </Button>
                        <Box flexGrow={1} />
                        <Button variant="contained" size="small" ref={editLinkDialogCancelButton} onClick={() => {setEditLinkDialogOpen(false)}}>Cancel</Button>
                    </Stack>
                </Box>
            </Modal>
            <Popover
                id="entry-popover"
                anchorEl={popoverAnchorEl}
                open={popoverOpen}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left"
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left"
                }}
                sx={{pointerEvents: "none"}}
                onClose={() => {setPopoverAnchorEl(null);}}
                disableRestoreFocus
            >
                <Typography paragraph variant="caption" padding="3px" sx={{mb: 0}}>
                    guid: {linkGuid} <br />
                    href: {linkUrl?.toString()} <br />
                    tags: {linkTags}
                </Typography>
            </Popover>
            <Stack 
                spacing={0} 
                minHeight={constants.INNER_MIN_HEIGHT} 
                minWidth={constants.INNER_MIN_WIDTH}
                maxWidth={constants.INNER_MAX_WIDTH} 
                sx={{
            }}>
                <TextField
                    variant="outlined"
                    size="small"
                    label="Search Links"
                    inputRef={searchField}
                    InputProps={{
                        // tabIndex: 2,
                        endAdornment: <InputAdornment position="end">
                            <SearchIcon fontSize="small" />
                        </InputAdornment>,
                    }}
                    sx={{marginBottom: "4px"}}
                    onChange={(e) => {setSearchTerm(searchField.current.value)}}
                />
                <Box 
                    boxSizing="border-box"
                    sx={{
                        overflowY: "scroll",
                        overflowX: "hidden",
                        scrollbarWidth: "thin",
                        maxWidth: "100%",
                        maxHeight: constants.SCROLLER_MAX_HEIGHT,
                    }}
                >
                    {buildListSorted()}
                </Box>
                <Box flexGrow={1} />
                <Stack spacing={1} sx={{mt: 2}} direction="row" alignItems="center">
                    <Fab 
                        variant="extended"
                        ref={addLinkButton}
                        onClick={() => {
                            openAddLinkDialog();
                        }}
                        size="small"
                        color="primary"
                        // tabIndex={1}
                    >
                        <AddIcon />
                        <Box sx={{pr: 1}}>
                            Add Link
                        </Box>
                    </Fab>
                    <Box flexGrow={1} />
                    <IconButton
                        id="long-button"
                        onClick={handleHamburgerClick}
                        size="small"
                    >
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        id="long-menu"
                        anchorEl={hamburgerAnchorEl}
                        open={hamburgerOpen}
                        onClose={handleHamburgerClose}
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
                        {__IN_DEBUG__ ? 
                                <MenuItem
                                    key="dump_json"
                                    onClick={() => {
                                        handleHamburgerClose();
                                        setJsonDumpOpen(true);
                                    }}
                                    sx={{color: "secondary.main"}}
                                >
                                    Dump JSON...
                                </MenuItem>
                            :
                            null
                        }
                        {__IN_DEBUG__ ? 
                                <MenuItem
                                    key="add_debug_links"
                                    divider
                                    onClick={() => {
                                        let linkDir = JSON.parse(JSON.stringify(__DEBUG_LIST__, JsonReplacer), JsonReviver);
                                        updateLinks(linkDir);
                                        handleHamburgerClose();
                                    }}
                                    sx={{color: "secondary.main"}}
                                >
                                    Load Debug List...
                                </MenuItem>
                            :
                            null
                        }
                        <MenuItem  
                            key="delete" 
                            divider 
                            onClick={() => {setDialogOpen(true)}} 
                            sx={{
                                color: "error.main",
                            }}
                        >
                            Delete Account...
                        </MenuItem>
                        <MenuItem key="logout" onClick={logout} selected>Logout</MenuItem>
                    </Menu>
                </Stack>
                <Dialog 
                    open={dialogOpen}
                    onClose={handleDialogClose}
                    >
                    <DialogTitle>{"Delete Account?"}</DialogTitle>
                    <DialogContent sx={{
                            overflow: "hidden",
                        }}>
                        <DialogContentText>Are you sure you want to delete this account?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={(e) => {setDialogOpen(false)}} autoFocus>Go Back</Button>
                        <Button onClick={(e) => {setDialogOpen(false); deleteAcct()}} sx={{color: 'error.main'}}>DELETE</Button>
                    </DialogActions>
                </Dialog>
            </Stack>
        </Box>
    )
}

export default ViewLinks;