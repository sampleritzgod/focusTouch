import { createApp } from "./app.js";
import { env } from "./core/config/env.js";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`FocusTouch API listening on http://localhost:${env.PORT}`);
  console.log(`Health check: http://localhost:${env.PORT}/health`);
});
