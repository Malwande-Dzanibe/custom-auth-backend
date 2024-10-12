import production from "./production";
import type { Logger } from "winston";

let logger: Logger | null = null;

if (process.env.PORT) {
  logger = production();
}

export default logger;
