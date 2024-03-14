/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SearchWorker } from "./search.worker";
import languageSupport from "@microbit/lunr-languages/lunr.fr";

new SearchWorker(self as DedicatedWorkerGlobalScope, "fr", languageSupport);
