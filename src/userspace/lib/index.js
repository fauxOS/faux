import Pathname from "../../misc/pathname.js";
import fs from "./fs/index.js";
import process from "./process/index.js";

import cli from "./cli/index.js";

self.Pathname = Pathname;
self.fs = fs;
self.process = process;

self.cli = cli;
