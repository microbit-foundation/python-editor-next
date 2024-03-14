/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SearchWorker } from "./search";
import languageSupport from "@microbit/lunr-languages/lunr.es";

new SearchWorker(self as DedicatedWorkerGlobalScope, languageSupport);
