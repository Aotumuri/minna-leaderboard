#!/usr/bin/env node
import "dotenv/config";
import fs from "fs";
import path from "path";

import { initDB } from "../server/db.js";
import { startServer } from "../server/script.js";

const SERVER_CONFIG_PATH = process.env.SERVER_CONFIG_PATH || "data/config.json";
const DATABASE_PATH = process.env.DATABASE_PATH || "data/leaderboard.sqlite";

// TODO: GUIで最後に自由に入力できるようにする
var dummy_config = {
  database: [
    {
      field: "name",
      type: "TEXT",
      regex: "^[a-zA-Z0-9]{1,16}$",
    },
    {
      field: "kill",
      type: "INTEGER",
      min: 0,
      max: 4,
    },
    {
      field: "time",
      type: "REAL",
      min: 0,
      max: 180,
      decimal: 2,
    },
    {
      field: "score",
      type: "REAL",
      min: 0,
      max: 1000,
      decimal: 2,
    },
  ],
  server: [
    {
      port: 4000,
      type: "public",
      sites: [
        {
          name: "ktv1",
          leaderboard: ["name", "kill", "time", "score"],
          sort: {
            type: "ASC",
            key: "score",
          },
        },
      ],
    },
    {
      port: 5500,
      type: "admin",
      sites: [
        {
          name: "staff",
          password: "root",
          permission: ["add"],
        },
        {
          name: "moderator",
          password: "root",
          permission: ["add", "remove"],
        }
      ],
    },
    {
        port: 3001,
        type: "api"
    }
  ],
  score: {
    ktv1: {
      cal: "kill * 600 + (30 - time) / 30 * 400",
    },
  },
};

const config = JSON.stringify(dummy_config);
const dir = path.dirname(SERVER_CONFIG_PATH);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(SERVER_CONFIG_PATH, config);

initDB(DATABASE_PATH, dummy_config);
startServer();
