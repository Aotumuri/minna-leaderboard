#!/usr/bin/env node
import "dotenv/config";
import fs from "fs";
import path from "path";

import { setDB } from "../server/db.js";
import { startServer } from "../server/script.js";

const SERVER_CONFIG_PATH = process.env.SERVER_CONFIG_PATH || "data/config.json";
const DATABASE_PATH = process.env.DATABASE_PATH || "data/leaderboard.sqlite";

setDB(DATABASE_PATH);
startServer();
