//
// Copyright (c) Doug Powers. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
import {createRoot} from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById('reactapp')!);
root.render(<App />, );