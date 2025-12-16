#!/usr/bin/env node
import "dotenv/config";

import { setDB } from "../server/db.js";
import { startServer } from "../server/script.js";

const DATABASE_PATH = process.env.DATABASE_PATH || "data/leaderboard.sqlite";

setDB(DATABASE_PATH);
startServer();
