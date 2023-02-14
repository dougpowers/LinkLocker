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
import KeyboardDoubleArrowDown from "@mui/icons-material/KeyboardDoubleArrowDown";
import KeyboardDoubleArrowUp from "@mui/icons-material/KeyboardDoubleArrowUp";
import { createRef, ReactNode, useEffect, MouseEvent, useState } from "react";
import * as browser from "webextension-polyfill";
import * as constants from './constants';
import { LinkLockerLinkDir, LinkLockerLink, LinkLockerLinkHost, JsonReplacer, JsonReviver } from "./App";
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

declare var __IN_DEBUG__: boolean;
declare var __DEBUG_LIST__: string;

type Props = {
    linkDir: LinkLockerLinkDir | null,
    updateLinks: (linkList: LinkLockerLinkDir) => void,
    logout: () => void;
    deleteAcct: () => void;
}

interface LinkLockerLinkResult extends LinkLockerLink {
    favicon: string,
}

export const enum SortMode {
    AlphabeticalByName = "Name",
    Timestamp = "Date",
    AlphabeticalByHost = "Host",
}

export const enum SortDirection {
    Ascending = "Ascending",
    Descending = "Descending"
}

const ViewLinks = ({linkDir: linkDir, updateLinks, logout, deleteAcct}: Props) => {
    
    var entryScrollAmount: number = 0;
    var entryScrollInterval: number;

    const addLinkButton: any = createRef();
    const addLinkNameField: any = createRef();
    const addLinkTagsField: any = createRef();
    const addHostTagsField: any = createRef();
    const addLinkModalAddButton: any = createRef();
    const addLinkModalCancelButton: any = createRef();
    const editLinkNameField: any = createRef();
    const editLinkTagsField: any = createRef();
    const editLinkModalAddButton: any = createRef();
    const editLinkModalCancelButton: any = createRef();
    const editHostTagsField: any = createRef();
    const editHostModalAddButton: any = createRef();
    const editHostModalDeleteButton: any = createRef();
    const editHostModalCancelButton: any = createRef();
    const linkDisplayBox: any = createRef();
    const searchField: any = createRef();
    const sortModeSelector: any = createRef();
    const sortDirectionSelector: any = createRef();
    const [hamburgerAnchorEl, setHamburgerAnchorEl] = useState<null | HTMLElement>(null);
    const hamburgerOpen = Boolean(hamburgerAnchorEl);
    const [linkPopoverAnchorEl, setLinkPopoverAnchorEl] = useState<null | HTMLElement>(null);
    const linkPopoverOpen = Boolean(linkPopoverAnchorEl);
    const [hostPopoverAnchorEl, setHostPopoverAnchorEl] = useState<null | HTMLElement>(null);
    const hostPopoverOpen = Boolean(hostPopoverAnchorEl);
    const [sortModeMenuAnchorEl, setSortModeMenuAnchorEl] = useState<null | HTMLElement>(null);
    const sortModeMenuOpen = Boolean(sortModeMenuAnchorEl);
    const [acctDeleteDialogOpen, setAcctDeleteDialogOpen] = useState(false);
    const [hostDeleteDialogOpen, setHostDeleteDialogOpen] = useState(false);
    const [addLinkModalOpen, setAddLinkModalOpen] = useState(false);
    const [editLinkModalOpen, setEditLinkModalOpen] = useState(false);
    const [editHostModalOpen, setEditHostModalOpen] = useState(false);
    const [jsonDumpOpen, setJsonDumpOpen] = useState(false);
    const [linkGuid, setLinkGuid] = useState("");
    const [linkFaviconUrl, setLinkFaviconUrl] = useState("");
    const [linkUrl, setLinkUrl] = useState<null | URL>(null);
    const [linkName, setLinkName] = useState("");
    const [linkTags, setLinkTags] = useState("");
    const [host, setHost] = useState<null | LinkLockerLinkHost>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortMode, setSortMode] = useState<SortMode>(SortMode.AlphabeticalByHost);
    const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.Descending);
    const [newHost, setNewHost] = useState(false);

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

    const deleteHost = () => {
        if (host != null) {
            linkDir?.hosts.delete(host.hostname);
        }
    }

    const editHost = (hostname: string, tags: Array<string>) => {
        let host = linkDir?.hosts.get(hostname);

        if (host) {
            host.tags = tags;
        }
        if (linkDir) updateLinks(linkDir);
    }

    const openEditHostDialog = (hostname: string) => {
        let host = linkDir?.hosts.get(hostname);
        if (host) {
            setHost(host)
            setEditHostModalOpen(true);
        }
    }

    const setCurrentLink = (link: LinkLockerLink) => {
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
            setLinkFaviconUrl(tabs.at(0)!.favIconUrl!);
            let url = new URL(tabs.at(0)!.url!);
            setLinkUrl(url);

            let host = linkDir?.hosts.get(url.hostname);
            let hostTags = host?.tags;
            if (host) {
                setNewHost(false);
                if (hostTags) {
                    setLinkTags(hostTags.join(" "));
                } else {
                    setLinkTags("");
                }
            } else {
                setNewHost(true);
                setLinkTags("");
            }
            setLinkName(trimTitle(tabs.at(0)!.title!, url));
            setAddLinkModalOpen(true);
        }).catch((err) => {console.debug(err)});
    }    

    const openEditLinkDialog = (link: LinkLockerLink) => {
        let url = new URL(link.href);
        let favicon = linkDir?.hosts.get(url.hostname)?.favicon;
        let hostTags = linkDir?.hosts.get(url.hostname)?.tags;
        if (favicon) setLinkFaviconUrl(favicon);

        setLinkGuid(link.guid);
        setLinkUrl(new URL(link.href));
        setLinkName(link.name);
        setLinkTags(link.tags.join(" "));
        setEditLinkModalOpen(true);
    }

    const addLink = (url: URL, name: string, favicon: string, tags: Array<string>, newHostTags: Array<string>) => {
        browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
            if (tabs.at(0) != undefined && tabs.at(0)!.url) {
                tags = tags.concat(newHostTags);
                let link: LinkLockerLink = {
                    guid: uuidv4(),
                    href: url.toString(),
                    name: name,
                    timestamp: Date.now(),
                    tags: tags,
                    url: url
                }
                
                if (linkDir == null) {
                    linkDir = {hosts: new Map()};
                    linkDir.hosts.set(url.hostname, {hostname: url.hostname, favicon: favicon, links: [link], tags: newHostTags});
                } else {
                    if (linkDir.hosts.get(url.hostname)) {
                        linkDir.hosts.get(url.hostname)!.links.push(link);
                    } else {
                        linkDir.hosts.set(url.hostname, {hostname: url.hostname, favicon: favicon, links: [link], tags: newHostTags});
                    }
                }
                updateLinks(linkDir!);
            } else {
            }
        }).catch((err) => {console.debug(err)});
    }

    const editLink = (guid: string, url: URL, name: string, favicon: string, tags: Array<string>) => {
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

    const handleAcctDeleteDialogClose = () => {

    }

    const handleHostDeleteDialogClose = () => {

    }

    const removeLink = (link: LinkLockerLink) => {
        let host = linkDir!.hosts.get(new URL(link.href).hostname)!;
        host.links.splice(host.links.findIndex((l) => {if (l.guid == link.guid) {return true;}}), 1);
        if (host.links.length == 0) {linkDir!.hosts.delete(host.hostname);}
        updateLinks(linkDir!);
    }

    const buildListSorted = (): ReactNode => {

        const resultsFromHosts = (hosts: LinkLockerLinkHost[]): LinkLockerLinkResult[] => {
            let list: LinkLockerLinkResult[] = new Array();
            for (let host of hosts) {
                list = list.concat(host.links.map(l => {return {...l, favicon: host.favicon ? host.favicon : ""}}));
            }
            return list;
        }

        const resultsFromLinks = (links: LinkLockerLink[]): LinkLockerLinkResult[] => {
            let list: LinkLockerLinkResult[] = links.map(v => {
                let favicon: (string | undefined) = linkDir?.hosts.get(v.url.hostname)?.favicon;
                return {...v, favicon: favicon ? favicon : ""}
            });
            return list;
        }

        const hostsFromResults = (results: LinkLockerLinkResult[]): LinkLockerLinkHost[] => {
            let hosts: LinkLockerLinkHost[] = new Array();
            console.debug(results);
            for (let result of results) {
                let index = hosts.findIndex(v => v.hostname == result.url.hostname);
                if (index >= 0) {
                    hosts[index].links.push(result);
                } else {
                    hosts.push({hostname: result.url.hostname, favicon: result.favicon, links: [result]})
                }
            }
            console.debug(hosts);
            return hosts;
        }

        const resultsFromDir = (dir: LinkLockerLinkDir): LinkLockerLinkResult[] => {
            let linkResults: LinkLockerLinkResult[] = new Array();
            for (let [hostname, host] of dir.hosts) {
                linkResults = linkResults.concat(host.links.map(l => {return {...l, favicon: host.favicon ? host.favicon : ""}}))
            }
            return linkResults;
        }

        const tokeniseStringWithQuotesBySpaces = (string: string): string[] => {
            return string.match(/("[^"]*?"|[^"\s]+)+(?=\s*|\s*$)/g) ?? [];
        }
        const getLinkEntry = (link: LinkLockerLink, favicon: (string| null | undefined), padding?: number): ReactNode => {
            if (!padding) padding = 0.5;

            let icon: ReactNode;
            if (favicon == null) {
                icon = null;
            } else if (favicon == undefined || favicon == '') {
                icon = <LinkIcon sx={{fontSize: 16, color: "text.primary"}}/>
            } else {
                icon = <img src={favicon} width="16px" height="16px" key={favicon}></img>;
            }
            return (
                <Stack 
                    direction="row" 
                    justifyItems="left" 
                    maxWidth={constants.LINK_ENTRY_MAX_WIDTH}
                    sx={{m: 0, mb: "0.1rem", mt: "0.1rem"}} 
                    alignItems="center" 
                    key={link.name+link.timestamp.toString()}
                    onMouseOver={function (e) {
                        (Array.from(e.currentTarget.querySelectorAll("button")) as HTMLButtonElement[]).forEach((v) => {v.style.display = "inline-flex"})
                    }}
                    onMouseOut={function (e) {
                        (Array.from(e.currentTarget.querySelectorAll("button")) as HTMLButtonElement[]).forEach((v) => {v.style.display = "none";})
                    }}
                >
                    {
                        icon
                    }
                    <Link 
                        variant="caption" 
                        href={link.href} 
                        key={link.href+link.timestamp.toString()} 
                        onMouseEnter={(e) => {
                            var target = e.currentTarget;
                            var scrollMax = target.scrollWidth - target.offsetWidth + constants.ASSUMED_LINK_BUTTON_BAR_WIDTH;

                            if (scrollMax > 0) {
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
                            ml: padding,
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
                            setCurrentLink(link);
                            setLinkPopoverAnchorEl(e.currentTarget.parentElement);
                        }}
                        onMouseLeave={(e) => {
                            setLinkPopoverAnchorEl(null);
                        }}
                        sx={{
                            p: "1px",
                            ml: 1.5,
                            mr: 1,
                            maxWidth: "0px",
                            maxHeight: "0px",
                            display: "none"
                        }}
                    >
                    <InfoIcon 
                        sx={{
                            fontSize: 16, 
                            color: "text.primary",
                            opacity: "inherit",
                        }} 
                    />
                    </IconButton>
                    <IconButton size="small" 
                        onClick={(e) => {
                            openEditLinkDialog(link);
                        }}
                        onFocus={(e) => {
                        }}
                        onBlur={(e) => {
                        }}
                        sx={{
                            p: "1px",
                            ml: 1,
                            mr: 1,
                            maxWidth: "0px",
                            maxHeight: "0px",
                            display: "none"
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
                            // e.currentTarget.style.opacity = "0%"
                        }}
                        sx={{
                            p: "1px",
                            ml: 1,
                            mr: 1,
                            maxWidth: "0px",
                            maxHeight: "0px",
                            display: "none"
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
        }

        const renderGroupByHost = (linkHosts: LinkLockerLinkHost[]) => {
            return (linkHosts.map((host, index) => {
                    return (
                        <Stack direction="column" sx={{
                            p: 0.12,
                            m: 0.12
                        }} justifyItems="left" alignItems="left" key={index}>
                            <Stack 
                                onMouseOver={function (e) {
                                    (Array.from(e.currentTarget.querySelectorAll("button")) as HTMLButtonElement[]).forEach((v) => {v.style.display = "inline-flex";})
                                }}
                                onMouseOut={function (e) {
                                    (Array.from(e.currentTarget.querySelectorAll("button")) as HTMLButtonElement[]).forEach((v) => {v.style.display = "none";})
                                }}
                                direction="row" 
                                justifyItems="left" 
                                sx={{m: 0.12, p: 0.12}} 
                                alignItems="center" 
                                key={host.hostname}
                            >
                                {
                                    host.favicon ?
                                    <img src={host.favicon} width="16px" height="16px" key={host.favicon}></img>
                                    :
                                    <LinkIcon sx={{
                                        fontSize: 16,
                                        color: "text.primary"
                                    }}/>
                                }
                                <Typography variant="body2" sx={{ml: 0.5}} key={host.hostname}>
                                    {host.hostname}
                                </Typography>
                                <Box flexGrow={1}/>
                                <IconButton size="small" 
                                    onMouseEnter={(e) => {
                                        setHost(host);
                                        setHostPopoverAnchorEl(e.currentTarget.parentElement);
                                    }}
                                    onMouseLeave={(e) => {
                                        setHostPopoverAnchorEl(null);
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.display = "inline-flex"
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.display = "none"
                                    }}
                                    sx={{
                                        p: "1px",
                                        ml: 1.5,
                                        mr: 1,
                                        maxWidth: "0px",
                                        maxHeight: "0px",
                                        display: "none",
                                    }}
                                >
                                    <InfoIcon 
                                        sx={{
                                            fontSize: 16, 
                                            color: "text.primary",
                                            opacity: "inherit",
                                        }} 
                                    />
                                </IconButton>
                                <IconButton size="small" 
                                    onClick={(e) => {
                                        openEditHostDialog(host.hostname);
                                        // e.currentTarget.style.opacity = "0%"
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.opacity = "100%"
                                    }}
                                    onBlur={(e) => {
                                        // e.currentTarget.style.opacity = "0%"
                                    }}
                                    sx={{
                                        p: "1px",
                                        ml: 1,
                                        mr: 1,
                                        maxWidth: "0px",
                                        maxHeight: "0px",
                                        display: "none",
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
                            </Stack>
                            <Stack direction="column" justifyItems="left" sx={{mt: 0}} alignItems="left" key={JSON.stringify(host.links.at(0)!.timestamp)}>
                            {host.links.map((link) => {
                                return (
                                    getLinkEntry(link, null, 2)
                                );
                            })}
                            </Stack>
                        </Stack>
                    );
                }
            ));
        }

        const renderGroupByDate = (links: LinkLockerLinkResult[]) => {
            let dateCount = new Date(0);

            return (links.map((link, i) => {
                let header: (ReactNode | null) = null;
                if (new Date(link.timestamp).toDateString() != dateCount.toDateString()) {
                    dateCount = new Date(link.timestamp);
                    header = <Typography variant="body2" sx={{m: .24, p: .24}}>{dateCount.toDateString()}</Typography>
                }
                return (
                    [
                        header,
                        getLinkEntry(link, link.favicon, 2),
                    ]
                );
            }));
        }

        const renderFlat = (links: LinkLockerLinkResult[]) => {
            return (links.map((link) => {
                return (
                    getLinkEntry(link, link.favicon)
                );
            }));
        }

        const sortLinks = (links: LinkLockerLinkResult[], sortMode: SortMode, sortDirection: SortDirection): LinkLockerLinkResult[] => {
            links.sort((a,b) => {
                switch (sortMode) {
                    case SortMode.AlphabeticalByHost:
                        return 1;
                    
                    case SortMode.AlphabeticalByName:
                        if (sortDirection == SortDirection.Descending) {
                            return a.name.localeCompare(b.name);
                        } else {
                            return -1*a.name.localeCompare(b.name);
                        }

                    case SortMode.Timestamp:
                        if (sortDirection == SortDirection.Descending) {
                            return b.timestamp - a.timestamp;
                        } else {
                            return a.timestamp - b.timestamp;
                        }
                }
            });

            return links;
        }

        const sortHosts = (hosts: LinkLockerLinkHost[], sortMode: SortMode, sortDirection: SortDirection): LinkLockerLinkHost[] => {
            hosts.sort((a,b) => {
                switch (sortMode) {
                    case SortMode.AlphabeticalByHost:
                        let domainsA: Array<string> = a.hostname.split(".");
                        let domainsB: Array<string> = b.hostname.split(".");
                        
                        if (domainsA && domainsA[0] == "") {
                            return -1;
                        } else if (domainsB && domainsB[0] == "") {
                            return 1;
                        }

                        if (domainsA.length > 1) {
                            domainsA.pop();
                        }
                        if (domainsB.length > 1) {
                            domainsB.pop();
                        }
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
                        if (sortDirection == SortDirection.Descending) {
                            return sortA.localeCompare(sortB);
                        } else {
                            return -1*sortA.localeCompare(sortB);
                        }
                    case SortMode.AlphabeticalByName:
                        return 1;
                    case SortMode.Timestamp:
                        return 1;
                }
            });

            return hosts;
        }

        if(linkDir != null && linkDir.hosts.size > 0 && searchTerm == "") {
            if (sortMode == SortMode.AlphabeticalByHost) {
                return renderGroupByHost(sortHosts(Array.from(linkDir.hosts.values()), sortMode, sortDirection));
            } else if (sortMode == SortMode.AlphabeticalByName) {
                return renderFlat(sortLinks(resultsFromDir(linkDir), sortMode, sortDirection));
            } else if (sortMode == SortMode.Timestamp) {
                return renderGroupByDate(sortLinks(resultsFromDir(linkDir), sortMode, sortDirection));
            }
        } else if (searchTerm != "" && linkDir) {
            let excludedHosts: string[] = [];
            let includedHosts: string[] = [];
            let includedTags: string[] = [];
            let excludedTags: string[] = [];

            let query: string = searchTerm;
            let hosts = Array.from(linkDir.hosts.values());

            query = query.replaceAll(
                /(\+|-)?(?:site:|host:)([^\s]*)/g, 
                (_match, p1, p2) => {
                    if (p1 === "-") {
                        excludedHosts.push(p2);
                    } else {
                        includedHosts.push(p2)
                    }
                    return "";
                }
            )

            query = query.replaceAll(
                /(\+|-)?tag:([^\s]*)/g, 
                (_match, p1, p2) => {
                    if (p1 === "-") {
                        excludedTags.push(p2);
                    } else {
                        includedTags.push(p2)
                    }
                    return "";
                }
            )

            if (includedHosts.length > 0) {
                hosts = hosts.filter((v) => {
                    for (let incl of includedHosts) {
                        if (v.hostname.match(incl)) {return true;} else {return false;}
                    }
                });
            } else if (excludedHosts.length > 0) {
                hosts = hosts.filter((v) => {
                    for (let excl of excludedHosts) {
                        if (v.hostname.match(excl)) {return false;} else {return true;}
                    }
                })
            }

            if (includedTags.length > 0) {
                let filteredHosts: LinkLockerLinkHost[] = new Array();
                for (let host of hosts) {
                    let links = host.links.filter((link) => {
                        for (let tag of link.tags) {
                            for (let incl of includedTags) {
                                if (tag == incl) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    })
                    if (links.length > 0) filteredHosts.push({...host, links: links})
                }
                hosts = filteredHosts;
            }

            if (excludedTags.length > 0) {
                let filteredHosts: LinkLockerLinkHost[] = new Array();
                for (let host of hosts) {
                    let links = host.links.filter((link) => {
                        for (let tag of link.tags) {
                            for (let excl of excludedTags) {
                                if (tag == excl) {
                                    return false;
                                }
                            }
                        }
                        return true;
                    })
                    if (links.length > 0) filteredHosts.push({...host, links: links})
                }
                hosts = filteredHosts;
            }


            if (!(query.match(/^[\s]*$/))) {
                let tokenizedTerm = tokeniseStringWithQuotesBySpaces(query);

                let linkList = hosts.flatMap(v => {return v.links;})

                const fuse = new Fuse(linkList, {
                    keys: [
                        {name: "name", weight: 0.8}, 
                        {name: "href", weight: 0.3}, 
                        {name: "tags", weight: 1},
                    ],
                    useExtendedSearch: true,
                    threshold: 0.2,
                    findAllMatches: true,
                    ignoreLocation: true,
                });

                const result = fuse.search({
                    $and: tokenizedTerm.map((searchToken: string) => {
                        const orFields: Fuse.Expression[] = [
                            { "name": searchToken },
                            { "href": searchToken },
                            { "tags": searchToken },
                        ];

                        return {
                            $or: orFields,
                        };
                    }),
                });

                if (result.length > 0) {
                    if (sortMode == SortMode.AlphabeticalByName) {
                        return renderFlat(
                            sortLinks(resultsFromLinks(result.map(r => {return r.item})), sortMode, sortDirection)
                        );
                    } else if (sortMode == SortMode.AlphabeticalByHost) {
                        console.debug(linkDir);
                        return renderGroupByHost(sortHosts(hostsFromResults(result.map(r => {console.debug(r.item.url);return {...r.item, favicon: linkDir?.hosts.get(r.item.url.hostname)?.favicon as string}})), sortMode, sortDirection))
                    } else if (sortMode == SortMode.Timestamp) {
                        return renderGroupByDate(sortLinks(resultsFromLinks(result.map(r => {return r.item})), sortMode, sortDirection))
                    }
                } else {
                    return (
                        <Typography variant="body2">No results found.</Typography>
                    );
                }
            } else {
                if (hosts.length == 0) {
                    return (
                        <Typography variant="body2">No results found.</Typography>
                    );
                }
                if (sortMode == SortMode.AlphabeticalByHost) {
                    return renderGroupByHost(sortHosts(hosts, sortMode, sortDirection));
                } else if (sortMode == SortMode.AlphabeticalByName) {
                    return renderFlat(sortLinks(resultsFromHosts(hosts), sortMode, sortDirection));
                } else {
                    return renderGroupByDate(sortLinks(resultsFromHosts(hosts), sortMode, sortDirection));
                }
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
            if (e.key === "s" && document.activeElement?.tagName != "INPUT" && addLinkModalOpen == false) {
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
                        maxRows={12}
                    />
                </Box>
            </Modal>
            :
            null
        }
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
                fullWidth
                InputProps={{
                    endAdornment: <InputAdornment position="end">
                        <SearchIcon fontSize="small" />
                        </InputAdornment>,
                }}
                sx={{marginBottom: "4px"}}
                onKeyDown={(e) => {if (e.key == "Enter") {setSearchTerm(searchField.current.value); searchField.current.select()}}}
            />
            <Stack direction="row" alignItems="center" sx={{mb: "0.4rem", mt: "0.2rem"}}>
                <Typography
                    variant="body2"
                    sx={{
                        color: "text.primary",
                        ml: "0.4rem",
                        mr: "0.3rem",
                    }} 
                >
                    Sort by
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        cursor: "pointer",
                    }} 
                    bgcolor="primary.main"
                    borderRadius="6px"
                    pl="0.2rem"
                    pr="0.2rem"
                    color="primary.contrastText"
                    mr="0.05rem"
                    onClick={(e) => {setSortModeMenuAnchorEl(e.currentTarget)}}
                    ref={sortModeSelector}
                >
                    {sortMode}
                </Typography>
                {
                    sortDirection == SortDirection.Descending ?
                        <KeyboardDoubleArrowDown 
                            ref={sortDirectionSelector} 
                            sx={{
                                cursor: "pointer", 
                                fontSize: 16, 
                                color: "primary.main",
                            }} 
                            onClick={() => {setSortDirection(SortDirection.Ascending); linkDisplayBox.current.scrollTo(0,0)}}
                        />
                    :
                        <KeyboardDoubleArrowUp 
                            ref={sortDirectionSelector} 
                            sx={{
                                // backgroundColor: "primary.main", 
                                // borderRadius: "6px",
                                cursor: "pointer", 
                                fontSize: 16, 
                                // color: "primary.contrastText", 
                                color: "primary.main",
                            }} 
                            onClick={() => {setSortDirection(SortDirection.Descending); linkDisplayBox.current.scrollTo(0,0)}}
                        />
                }
                <Menu 
                    id="sort-menu" 
                    anchorEl={sortModeMenuAnchorEl} 
                    open={sortModeMenuOpen}
                    onClose={() => {setSortModeMenuAnchorEl(null)}}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left"
                    }}
                    transformOrigin={{
                        vertical: "top",
                        horizontal: "left"
                    }}
                >
                    <MenuItem dense key="sort-host-alpha" 
                        onClick={() => {setSortMode(SortMode.AlphabeticalByHost); setSortModeMenuAnchorEl(null); linkDisplayBox.current.scrollTo(0,0)}}
                    >Host</MenuItem>
                    <MenuItem dense key="sort-title-alpha" 
                        onClick={() => {setSortMode(SortMode.AlphabeticalByName); setSortModeMenuAnchorEl(null); linkDisplayBox.current.scrollTo(0,0)}}
                    >Name</MenuItem>
                    <MenuItem dense key="sort-timestamp"
                        onClick={() => {setSortMode(SortMode.Timestamp); setSortModeMenuAnchorEl(null); linkDisplayBox.current.scrollTo(0,0)}}
                    >Date</MenuItem>
                </Menu>
            </Stack>
            <Box 
                boxSizing="border-box"
                sx={{
                    overflowY: "scroll",
                    overflowX: "hidden",
                    scrollbarWidth: "thin",
                    maxWidth: "100%",
                    maxHeight: constants.SCROLLER_MAX_HEIGHT,
                }}
                ref={linkDisplayBox}
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
                                dense
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
                                dense
                                key="add_debug_links"
                                divider
                                onClick={() => {
                                    // let debugList: LinkLockerLinkDir = JSON.parse(JSON.stringify(__DEBUG_LIST__, JsonReplacer), JsonReviver);
                                    let debugList: LinkLockerLinkDir = JSON.parse(__DEBUG_LIST__, JsonReviver);
                                    for (let [hostname, host] of debugList.hosts) {
                                        for (let link of host.links) {
                                            link.url = new URL(link.href);
                                        }
                                    }
                                    updateLinks(debugList);
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
                        dense
                        divider 
                        onClick={() => {setAcctDeleteDialogOpen(true)}} 
                        sx={{
                            color: "error.main",
                        }}
                    >
                        Delete Account...
                    </MenuItem>
                    <MenuItem dense key="download_backup" onClick={() => {
                        let link = document.createElement("a");
                        let date = new Date()
                        link.download = 
                            `ll-backup-`+
                            `${date.getFullYear()}`+
                            `${date.getMonth().toString().padStart(2, '0')}`+
                            `${date.getDate().toString().padStart(2, '0')}`+
                            `${date.getHours().toString().padStart(2, '0')}`+
                            `${date.getMinutes().toString().padStart(2, '0')}.json`
                        link.href = `data:text/html,${JSON.stringify(linkDir, JsonReplacer, 4)}`
                        link.style.display = "none";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.setTimeout(() => {window.close()}, 100);
                    }}
                    >Download Backup...</MenuItem>
                    <MenuItem dense key="logout" onClick={logout} selected>Logout</MenuItem>
                </Menu>
            </Stack>
        </Stack>
        <Modal
            open={editHostModalOpen}
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
                <Stack flexDirection="row">
                    <Typography
                        variant="h6"
                    >
                        Edit Host    
                    </Typography> 
                    <Box flexGrow={1}/>
                    <IconButton 
                    // variant="contained" 
                    // size="small" 
                    ref={editHostModalDeleteButton} 
                    color="error"
                    onClick={() => {
                        setEditHostModalOpen(false);
                        setHostDeleteDialogOpen(true);
                    }}>
                        <DeleteIcon/>
                    </IconButton>
                </Stack>
                <Box
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                >
                    <img src={host?.favicon} width="16px" height="16px" style={{marginRight: "5px"}}/>
                    <Typography
                        variant="caption"
                        marginTop="10px"
                        marginBottom="10px"
                    >
                        {host?.hostname}
                    </Typography>
                </Box>
                <TextField
                    variant="standard"
                    size="small"
                    label="Tags"
                    inputRef={editHostTagsField}
                    autoFocus={editHostModalOpen}
                    defaultValue={host?.tags?.join(" ")}
                    placeholder="Space-separated Tags"
                    onFocus={(e) => {
                        e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length);
                    }}
                    onKeyDown={
                        (e) => {
                            if (e.key == "Enter") {
                                e.preventDefault();
                                editHostModalAddButton.current.click()
                            }
                        }
                    }
                >
                </TextField>
                <Stack direction="row" spacing={2} marginTop="10px">
                    <Button 
                    variant="contained" 
                    size="small" 
                    ref={editHostModalAddButton} 
                    onClick={() => {
                        setEditHostModalOpen(false);
                        editHost(host!.hostname, editHostTagsField.current.value.split(" "));
                    }}>
                        Save Host
                    </Button>
                    <Box flexGrow={1} />
                    <Button variant="contained" size="small" ref={editHostModalCancelButton} onClick={() => {setEditHostModalOpen(false)}}>Cancel</Button>
                </Stack>
            </Box>
        </Modal>
        <Modal
            open={addLinkModalOpen}
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
                    autoFocus={addLinkModalOpen}
                    defaultValue={linkName}
                    onKeyDown={
                        (e) => {
                            if (e.key == "Enter") {
                                e.preventDefault();
                                addLinkModalAddButton.current.click()
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
                    defaultValue={linkTags}
                    onFocus={(e) => {
                        e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length);
                    }}
                    onKeyDown={
                        (e) => {
                            if (e.key == "Enter") {
                                e.preventDefault();
                                addLinkModalAddButton.current.click()
                            }
                        }
                    }
                >
                </TextField>
                {
                    newHost ?
                    <TextField
                        variant="standard"
                        size="small"
                        label="Host Tags"
                        onFocus={(e) => {
                            e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length);
                        }}
                        inputRef={addHostTagsField}
                        placeholder="Default tags for this host"
                        onKeyDown={
                            (e) => {
                                if (e.key == "Enter") {
                                    e.preventDefault();
                                    addLinkModalAddButton.current.click()
                                }
                            }
                        }
                    ></TextField>
                    :
                    null
                }
                <Stack direction="row" spacing={2} marginTop="10px">
                    <Button 
                    variant="contained" 
                    size="small" 
                    ref={addLinkModalAddButton} 
                    onClick={() => {
                        setAddLinkModalOpen(false);
                        if (newHost) {
                            addLink(linkUrl as URL, addLinkNameField.current.value, linkFaviconUrl, Array.from(addLinkTagsField.current.value.split(" ")), Array.from(addHostTagsField.current.value.split(" ")));
                        } else {
                            addLink(linkUrl as URL, addLinkNameField.current.value, linkFaviconUrl, Array.from(addLinkTagsField.current.value.split(" ")), new Array());
                        }
                        setNewHost(false);
                    }}>
                        Add Link
                    </Button>
                    <Box flexGrow={1} />
                    <Button variant="contained" size="small" ref={addLinkModalCancelButton} onClick={() => {setAddLinkModalOpen(false); setNewHost(false);}}>Cancel</Button>
                </Stack>
            </Box>
        </Modal>
        <Modal
            open={editLinkModalOpen}
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
                    autoFocus={editLinkModalOpen}
                    defaultValue={linkName}
                    onKeyDown={
                        (e) => {
                            if (e.key == "Enter") {
                                e.preventDefault();
                                editLinkModalAddButton.current.click()
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
                    onFocus={(e) => {
                        e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length);
                    }}
                    onKeyDown={
                        (e) => {
                            if (e.key == "Enter") {
                                e.preventDefault();
                                editLinkModalAddButton.current.click()
                            }
                        }
                    }
                >
                </TextField>
                <Stack direction="row" spacing={2} marginTop="10px">
                    <Button 
                    variant="contained" 
                    size="small" 
                    ref={editLinkModalAddButton} 
                    onClick={() => {
                        setEditLinkModalOpen(false);
                        editLink(linkGuid, linkUrl as URL, editLinkNameField.current.value, linkFaviconUrl, editLinkTagsField.current.value.split(" "));
                    }}>
                        Save Link
                    </Button>
                    <Box flexGrow={1} />
                    <Button variant="contained" size="small" ref={editLinkModalCancelButton} onClick={() => {setEditLinkModalOpen(false)}}>Cancel</Button>
                </Stack>
            </Box>
        </Modal>
        <Popover
            id="entry-popover"
            anchorEl={linkPopoverAnchorEl}
            open={linkPopoverOpen}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left"
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "left"
            }}
            sx={{pointerEvents: "none"}}
            onClose={() => {setLinkPopoverAnchorEl(null);}}
            disableRestoreFocus
        >
            <Typography paragraph variant="caption" padding="3px" sx={{mb: 0}}>
                href: {linkUrl?.toString()} <br />
                tags: {linkTags}
            </Typography>
        </Popover>
        <Popover
            id="host-popover"
            anchorEl={hostPopoverAnchorEl}
            open={hostPopoverOpen}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left"
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "left"
            }}
            sx={{pointerEvents: "none"}}
            onClose={() => {setHostPopoverAnchorEl(null);}}
            disableRestoreFocus
        >
                <Typography paragraph variant="caption" padding="3px" sx={{mb: 0}}>
                    tags: {host?.tags?.join(" ")}
                </Typography>
        </Popover>
        <Dialog 
            open={acctDeleteDialogOpen}
            onClose={handleAcctDeleteDialogClose}
            >
            <DialogTitle>{"Delete Account?"}</DialogTitle>
            <DialogContent sx={{
                    overflow: "hidden",
                }}>
                <DialogContentText>Are you sure you want to delete this account?</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={(e) => {setAcctDeleteDialogOpen(false)}} autoFocus>Go Back</Button>
                <Button onClick={(e) => {setAcctDeleteDialogOpen(false); deleteAcct()}} sx={{color: 'error.main'}}>DELETE</Button>
            </DialogActions>
        </Dialog>
        <Dialog 
            open={hostDeleteDialogOpen}
            onClose={handleHostDeleteDialogClose}
            >
            <DialogTitle>{"Delete All Host Links?"}</DialogTitle>
            <DialogContent sx={{overflow: "hidden"}}>
                <DialogContentText fontSize="1rem">Are you sure you want to delete {host?.links.length} link{(host != undefined && host.links.length) > 1 ? "s" : null} from this host?</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button size="small" onClick={(e) => {setHostDeleteDialogOpen(false)}} autoFocus>Go Back</Button>
                <Button size="small" onClick={(e) => {setHostDeleteDialogOpen(false); deleteHost()}} sx={{color: 'error.main'}}>DELETE</Button>
            </DialogActions>
        </Dialog>
    </Box>
);}

export default ViewLinks;