import winston from "winston";

const production = () => {
  return winston.createLogger({
    level: "infor",
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
  });
};

export default production;
