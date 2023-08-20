<script setup lang="ts">
import { message } from "ant-design-vue";
import { reactive, ref, watch, onMounted } from "vue";
import {
  SendOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  PlusOutlined,
} from "@ant-design/icons-vue";
import { postRemoteMessage } from "./api";
import MessageItem from "./components/MessageItem.vue";
import Header from "./components/Header.vue";
import SiderMenu from "./components/SiderMenu.vue";
import { guid } from "./utils";
import { nextTick } from "process";

// document.documentElement.style.setProperty("--white-color", "#3d5899");
// document.documentElement.style.setProperty("--blue-color", "#fff");
// document.documentElement.style.setProperty("--grey", "#333b71");
// document.documentElement.style.setProperty("--bg-grey", "#333b71");
// document.documentElement.style.setProperty("--layout-color", "#3d5899");

document.documentElement.style.setProperty("--white-color", "#fff");
document.documentElement.style.setProperty("--blue-color", "#1890ff");
document.documentElement.style.setProperty("--grey", "#999");
document.documentElement.style.setProperty("--bg-grey", "#f1fafb");
document.documentElement.style.setProperty("--layout-color", "#f0f2f5");

// @white-color: #3d5899;
// @blue-color: #fff;
// @grey: #333b71;
// @bg-grey: #333b71;
// @layout-color: #3d5899;

const recording = ref(false);
const mediaRecorder: any = ref(null);
const recordedChunks: any = ref([]);
const audioElementRef: any = ref(null);

const db = require("@electron/remote").getGlobal("db");

let sessions = reactive({
  data: (db.get("sessions") as any[]) || ([] as any[]),
});

let messages = reactive({
  data: [] as any,
});
const loading = ref(false);
const activeKey = ref();
const searchVal = ref("");
const isRecord = ref(false);
const audioBlobText = ref("");
if (sessions.data.length) {
  activeKey.value = sessions.data[0].id;
  messages.data = sessions.data[0].messages;
}

watch(activeKey, (newValue) => {
  updateMessages();
});

onMounted(() => {
  console.log(audioElementRef);

  scrollToBottom();
  hasApiKey();
});

const headerRef = ref<null | HTMLElement>(null) as any;
const hasApiKey = () => {
  const config = db.get("config") || {};
  if (!config.key) {
    headerRef.value.showKeyModal();
    return false;
  }
  return true;
};

const updateDB = () => {
  db.set("sessions", sessions.data);
};

const newSession = () => {
  if (!hasApiKey()) {
    return;
  }
  const id = guid();
  sessions.data.push({ id, name: "New session", messages: [] });
  activeKey.value = id;
  updateDB();
};

const updateMessages = () => {
  if (!sessions.data.length) return;
  messages.data = sessions.data.filter(
    (item) => item.id === activeKey.value
  )[0].messages;
  scrollToBottom();
  updateDB();
};

const appendMessage = (
  message: any,
  role: string,
  isRecord: boolean,
  audioBlobText: string
) => {
  sessions.data.forEach((item) => {
    if (item.id === activeKey.value) {
      if (role === "user") {
        message[0].audioBlobText = audioBlobText;
        item.messages = item.messages.concat(message);
      } else {
        console.log("item message", message);
        // item.messages.push(message);
        const lastItem = item.messages[item.messages.length - 1];
        lastItem.role = "system";
        lastItem.content = message;
      }
    }
  });
  updateMessages();
};

const send = async () => {
  if (loading.value || (!searchVal.value && !audioBlobText.value)) return;
  if (!hasApiKey()) {
    return;
  }
  if (!messages.data.length) {
    sessions.data.forEach((item) => {
      if (item.id === activeKey.value) {
        item.name = searchVal.value;
      }
    });
  }
  const message = [
    { role: "user", content: searchVal.value },
    { role: "system", content: "Entering..." },
  ];
  appendMessage(message, "user", false, audioBlobText.value);
  nextTick(() => {
    searchVal.value = "";
    audioBlobText.value = "";
  });
  loading.value = true;
  try {
    const result = await postRemoteMessage(
      messages.data.filter((item: any) => item.type !== "error")
    );

    appendMessage(result.data.data, "assistant", false, audioBlobText.value);
  } catch (error: any) {
    console.log("error", error);
    let msg = "";

    if (error.code === "ERR_NETWORK") {
      msg = error.message;
    } else {
      msg = error.response.data.error.message;
    }
    appendMessage(
      { role: "system", content: msg, type: "error" },
      "error",
      false,
      audioBlobText.value
    );
  }
  loading.value = false;
};

const onSelectedChange = (id: string) => {
  activeKey.value = id;
};

const onDeleteSession = (id: string) => {
  sessions.data = sessions.data.filter((item) => item.id !== id);
  activeKey.value = sessions.data.length ? sessions.data[0].id : "";
  updateDB();
  message.success("Success");
};

const messageContent = ref(null) as any;
const scrollToBottom = () => {
  nextTick(() => {
    if (messageContent.value) {
      messageContent.value.scrollTop = messageContent.value.scrollHeight;
    }
  });
};

// 录音

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.value = new MediaRecorder(stream);
    recordedChunks.value = [];
    mediaRecorder.value.ondataavailable = (event: any) => {
      if (event.data.size > 0) {
        console.log(event.data);

        recordedChunks.value.push(event.data);
        playRecordedAudio();
      }
    };

    mediaRecorder.value.start();
    recording.value = true;
  } catch (error) {
    console.error("Error accessing microphone:", error);
  }
};
const handleRecord = () => {
  if (!isRecord.value) {
    startRecording();
  } else {
    stopRecording();
  }
  isRecord.value = !isRecord.value;
};

const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state !== "inactive") {
    mediaRecorder.value.stop();
    recording.value = false;
  }
};

const playRecordedAudio = () => {
  const audioBlob = new Blob(recordedChunks.value, { type: "audio/wav" });
  console.log(audioBlob);
  // 创建一个FileReader对象
  const reader = new FileReader();

  // 当读取完成时的回调函数
  reader.onload = function (event: any) {
    const base64String = event.target.result;
    audioBlobText.value = base64String;
  };
  reader.readAsDataURL(audioBlob);

  const audioUrl = URL.createObjectURL(audioBlob);

  audioElementRef.value.src = audioUrl;
};
</script>

<template>
  <a-layout>
    <Header ref="headerRef" />
    <a-layout>
      <SiderMenu
        :active-key="activeKey"
        :newSession="newSession"
        :onSelectedChange="onSelectedChange"
        :onDeleteSession="onDeleteSession"
        :sessions="sessions"
      />
      <a-layout class="ant-layout">
        <a-layout-content class="content-wrap">
          <div class="no-data" v-if="!sessions.data.length">
            点击按钮开始对话
            <a-button type="primary" @click="newSession">
              <template #icon>
                <PlusOutlined />
              </template>
              新对话
            </a-button>
          </div>
          <template v-else>
            <div v-if="!messages.data.length" class="no-message">
              与chat-gpt对话
            </div>
            <div class="message-content" ref="messageContent">
              <MessageItem
                v-for="item in messages.data"
                :key="item"
                :item="item"
              />
            </div>
            <div class="message-content-footer">
              <a-button type="primary" class="record" @click="handleRecord">
                <!-- <SendOutlined /> -->
                <AudioOutlined v-if="!isRecord" />
                <AudioMutedOutlined v-if="isRecord" />
              </a-button>
              <!-- <button @click="startRecording" :disabled="recording">
                Start Recording
              </button>
              <button @click="stopRecording" :disabled="!recording">
                Stop Recording
              </button> -->
              <audio
                ref="audioElementRef"
                class="record-audio"
                controls
              ></audio>
              <a-textarea
                v-model:value="searchVal"
                autofocus
                :auto-size="{ minRows: 3 }"
                placeholder="输入信息"
                :maxlength="2000"
                @pressEnter="send"
              />
              <a-button
                type="primary"
                class="send"
                @click="send"
                :disabled="loading"
              >
                <SendOutlined />
              </a-button>
            </div>
          </template>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<style lang="less">
// @import url(./style.less);
.content-wrap {
  height: calc(100vh - 44px);
  display: flex;
  flex-direction: column;
}

.message-content {
  margin: 0 auto;
  position: relative;
  scroll-behavior: auto;
  overflow-y: auto;
  flex: 1 1 0%;
  width: 100%;
}

.message-content-footer {
  padding: 10px 30px;
  .record {
    position: absolute;
    bottom: 18px;
    left: 238px;
    z-index: 1;
  }

  .send {
    position: absolute;
    bottom: 18px;
    right: 38px;
    z-index: 1;
  }

  textarea {
    padding-right: 80px;
    padding-left: 60px;
    resize: none;
  }

  :deep(.ant-input-textarea-show-count::after) {
    position: absolute;
    left: 10px;
    bottom: 5px;
    z-index: 1;
  }
}

.no-message {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--grey);
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
  line-height: 40px;
}
.ant-layout {
  background: var(--layout-color);
}
</style>