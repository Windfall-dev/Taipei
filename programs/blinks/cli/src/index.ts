import { Command } from 'commander';
import dotenv from 'dotenv';

import {defineCommands as defineCommandsRaffle} from "./raffle";
import {defineCommands as defineCommandsDraw} from "./draw";

dotenv.config();

export const defaultConnection = process.env.RPC_CONNECTION || "http://localhost:8899";
export const defaultKeypairPath = process.env.KEYPAIR_PATH || "~/.config/solana/id.json";

export const program = new Command();

defineCommandsRaffle();
defineCommandsDraw();

try {
    program.parse(process.argv);
} catch (e) {
    console.log(`error occurred: ${e}`);
}
