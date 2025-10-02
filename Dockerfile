# Playwright の依存込み公式イメージをベースにするのが楽
FROM mcr.microsoft.com/playwright:v1.47.0-jammy

WORKDIR /srv/app

# ソースをコピー
COPY . .

# 依存インストール
RUN npm install

# ビルド
RUN npm run build

# MCP サーバ起動（dist/index.js を node で実行）

CMD ["node", "dist/index.js"]