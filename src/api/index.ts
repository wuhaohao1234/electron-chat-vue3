import axios from "axios";
const db = require("@electron/remote").getGlobal("db");

export const postRemoteMessage = async (messages: any) => {
  return await axios({
    method: "post",
    url: "http://www.morefunreading.com:30002/interface/voice/getIvr",
    headers: {
      "Content-Type": "application/json",
    },
    data:
      { "text": "aaaaaa", "callee": "1000" }
  });
};
