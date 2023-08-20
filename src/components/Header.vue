<script setup lang="ts">
import { message } from "ant-design-vue";
import { ref } from "vue";
import { SettingOutlined } from "@ant-design/icons-vue";
const ipcRenderer = window.require("electron").ipcRenderer;

const db = require("@electron/remote").getGlobal("db");
const config = db.get("config") || {};

const visible = ref(false);
const key = ref(config.key);

const isDark = ref(false);

const settingKey = () => {
  if (isDark.value) {
    document.documentElement.style.setProperty("--white-color", "#fff");
    document.documentElement.style.setProperty("--blue-color", "#1890ff");
    document.documentElement.style.setProperty("--grey", "#999");
    document.documentElement.style.setProperty("--bg-grey", "#f1fafb");
    document.documentElement.style.setProperty("--layout-color", "#f0f2f5");
  } else {
    document.documentElement.style.setProperty("--white-color", "#3d5899");
    document.documentElement.style.setProperty("--blue-color", "#fff");
    document.documentElement.style.setProperty("--grey", "#333b71");
    document.documentElement.style.setProperty("--bg-grey", "#333b71");
    document.documentElement.style.setProperty("--layout-color", "#3d5899");
  }
  isDark.value = !isDark.value;
};

const handleOk = () => {
  config.key = key.value;
  visible.value = false;
  db.set("config", config);
};

const showKeyModal = () => {
  visible.value = true;
};

defineExpose({
  showKeyModal,
});
</script>

<template>
  <a-layout-header class="header">
    <div>
      <!-- <img class="logo" src="/icon.png" /> -->
      <!-- Electron ChatGPT -->
    </div>
    <div class="right">
      <a-dropdown>
        <span class="tool-item" @click.prevent>
          <SettingOutlined />
        </span>
        <template #overlay>
          <a-menu style="width: 160px">
            <a-menu-item @click="settingKey">切换主题色</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
    <a-modal v-model:visible="visible" title="API Key setting" @ok="handleOk">
      <a-input v-model:value="key" placeholder="Please input api key" />
    </a-modal>
  </a-layout-header>
</template>

<style lang="less">
// @import url("../style.less");
.header {
  background-color: var(--white-color);
  font-size: 14px;
  height: 44px;
  line-height: 44px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eaeaea;
  justify-content: space-between;

  .logo {
    height: 32px;
    margin-right: 10px;
    width: 32px;
  }
}

.right {
  .tool-item {
    font-size: 16px;
    padding: 0 15px;
    cursor: pointer;
    display: inline-block;
    transition: all 0.15s;

    &:hover {
      background-color: #eaeaea;
    }
  }
}
</style>
