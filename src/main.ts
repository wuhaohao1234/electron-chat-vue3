import { createApp } from "vue";
import App from "./App.vue";
import "ant-design-vue/es/message/style/css";
// import './style.less'

createApp(App)
  .mount("#app")
  .$nextTick(() => { });
