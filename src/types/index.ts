export interface MessageProps {
  [x: string]: boolean;
  role: "system" | "user" | "assistant";
  content: string;
  type: string;
  audioBlobText: string;
}

export interface ErrorMessage {
  code: string;
  message: string;
}
