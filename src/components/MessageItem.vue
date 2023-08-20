<script setup lang="ts">
import { message } from "ant-design-vue";
import { UserOutlined, CopyOutlined } from "@ant-design/icons-vue";
import { MessageProps } from "../types";

import VMdPreview from "@kangc/v-md-editor/lib/preview";
import "@kangc/v-md-editor/lib/style/preview.css";
import githubTheme from "@kangc/v-md-editor/lib/theme/github.js";
import "@kangc/v-md-editor/lib/theme/style/github.css";
import createCopyCodePlugin from "@kangc/v-md-editor/lib/plugins/copy-code/index";
import "@kangc/v-md-editor/lib/plugins/copy-code/copy-code.css";
import useClipboard from "vue-clipboard3";
// highlightjs
import hljs from "highlight.js";
import { onMounted, ref } from "vue";

VMdPreview.use(githubTheme, {
  Hljs: hljs,
});

VMdPreview.use(createCopyCodePlugin());
const audioElementRef: any = ref(null);
const props = defineProps<{ item: any }>();

onMounted(() => {
  if (props.item.audioBlobText) {
    // audioElementRef.src = props.item.audioBlobText.toString();
    // 将Base64字符串解码为Uint8Array
    const base64String = props.item.audioBlobText.split(",")[1];
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // 创建Blob对象
    const blob = new Blob([byteArray], { type: "audio/wav" });
    console.log(blob);

    const audioUrl = URL.createObjectURL(blob);
    console.log(audioUrl);

    audioElementRef.value.src = audioUrl;
    // audioElementRef.controls = true;
  }
  console.log(props.item);
});

const { toClipboard } = useClipboard();

const copy = async (Msg: string) => {
  try {
    await toClipboard(Msg);
    message.success("Copy success");
  } catch (e) {
    console.error(e);
  }
};

const handleCopyCodeSuccess = () => {
  message.success("Copy success");
};
</script>

<template>
  <div :class="'message-item ' + item.role + ' ' + +item.type">
    <div class="head">
      <a-avatar v-if="item.role === 'user'" shape="square">
        <template #icon>
          <UserOutlined />
        </template>
      </a-avatar>
      <a-avatar v-else src="./chatgpt.png" shape="square" />
    </div>

    <div :class="'content ' + item.role">
      <CopyOutlined class="copy" @click="copy(item.content)" />
      <v-md-preview
        :text="item.content"
        @copy-code-success="handleCopyCodeSuccess"
      ></v-md-preview>
      <audio
        v-show="item.role === 'user' && item.audioBlobText.length > 0"
        ref="audioElementRef"
        class="record-audio"
        src="http://localhost:5173/6af12036-e993-4f13-90bc-4b304963afeb"
        controls
      ></audio>
    </div>
  </div>
</template>

<style scoped lang="less">
.message-item {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  padding: 15px 30px;

  .head {
    align-items: center;
    border-radius: 5px;
    color: var(--white-color);
    display: flex;
    font-weight: 700;
    justify-content: center;
    left: 3px;
    margin-right: 10px;
    position: absolute;
    top: 15px;
    left: 30px;
  }

  .content {
    position: relative;
    min-height: 20px;
    margin-left: 40px;
    margin-top: 5px;

    .copy {
      position: absolute;
      top: 0;
      right: 0;
      font-size: 16px;
      color: #666;
      cursor: pointer;
      display: none;
      background-color: var(--white-color);
      padding: 3px;
      z-index: 10;
    }

    &:hover .copy {
      display: block;
    }

    &.error {
      color: #f81d22;
    }
  }

  &.user {
  }

  &.assistant,
  &.error,
  &.system {
    background-color: var(--white-color);
  }
}

.read-the-docs {
  color: #888;
}

:deep(.github-markdown-body) {
  padding: 0px 0px 0px;
}
.record-audio {
  z-index: 1;
  outline: none !important;
  width: 100%;
  margin: 20px 0;
}
.record-audio::-webkit-media-controls-panel {
  border-radius: 8px;
  background-color: var(--layout-color);
}

/* 修改进度条的颜色 */
.record-audio::-webkit-media-controls-current-time-display,
.record-audio::-webkit-media-controls-time-remaining-display,
.record-audio::-webkit-media-controls-timeline {
  color: var(--grey);
}
</style>
