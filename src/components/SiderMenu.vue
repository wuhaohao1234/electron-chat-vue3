<script setup lang="ts">
import {
  PlusOutlined,
  DeleteOutlined,
  MessageOutlined,
} from "@ant-design/icons-vue";
defineProps<{
  activeKey: string;
  newSession: Function;
  onSelectedChange: Function;
  onDeleteSession: Function;
  sessions: any;
}>();
</script>

<template>
  <a-layout-sider width="200" style="background: #fff">
    <div class="sessions">
      <a-button type="dashed" block class="session-add" @click="newSession">
        <template #icon>
          <PlusOutlined />
        </template>
        新建对话
      </a-button>
      <div
        :class="{
          'session-item': true,
          active: activeKey === item.id,
        }"
        v-for="item in sessions.data"
        :key="item.id"
        @click="onSelectedChange(item.id)"
      >
        <MessageOutlined style="margin-right: 3px" />{{ item.name }}
        <a-popconfirm
          title="确认删除?"
          ok-text="删除"
          cancel-text="取消"
          @confirm="onDeleteSession(item.id)"
        >
          <DeleteOutlined
            class="delete"
            @click="(e: any) => e.stopPropagation()"
          />
        </a-popconfirm>
      </div>
    </div>
  </a-layout-sider>
</template>

<style lang="less">
.sessions {
  height: calc(100vh - 44px);
  background-color: var(--bg-grey);
  overflow-y: auto;
  padding: 15px 10px;

  .session-add {
    margin-bottom: 20px;
    border-color: var(--blue-color);
    color: var(--blue-color);
    background: var(--white-color);
  }

  .session-item {
    border: 1px solid #e5e7eb;
    cursor: pointer;
    background: var(--white-color);
    height: 36px;
    line-height: 34px;
    padding: 0 10px;
    border-radius: 3px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-right: 50px;
    position: relative;
    margin-bottom: 10px;

    :deep(.anticon) {
      margin-right: 5px;
    }

    &:hover {
      // color: @blue-color;

      .delete {
        display: block;
      }
    }

    &.active {
      color: var(--blue-color);
      border-color: var(--blue-color);
    }

    .delete {
      position: absolute;
      top: 10px;
      right: 5px;
      font-size: 14px;
      display: none;
    }
  }
}
</style>
