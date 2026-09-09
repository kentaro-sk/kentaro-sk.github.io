import { defineConfig } from 'astro/config';

// kentaro-sk.github.io はユーザーページ(ルートドメイン配信)のため、
// base設定は不要でsite直下にそのままデプロイされる。
export default defineConfig({
  site: 'https://kentaro-sk.github.io',
});
