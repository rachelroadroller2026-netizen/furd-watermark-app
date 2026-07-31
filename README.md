# FURD 共享水印工具

一个部署在 Vercel 的团队共享图片水印工具：

- 员工打开网址 → 上传图片 → 一键加水印 → 自动保存到云端
- 「图库」页展示所有已加水印的图片，任何人可浏览和下载
- 「设置」页可统一修改水印样式（全公司生效）
- 所有处理在浏览器本地完成，图片直接上传到 Vercel 云存储，不会经过第三方服务器

## 部署步骤（一次约 5 分钟）

### 前提

1. 一个 Vercel 账号（免费）：https://vercel.com/signup
2. 本机安装 Node.js（可选项，仅本地预览用）

### 方式一：用 Vercel 网页导入（不需要命令行）

1. 把本文件夹推到一个 GitHub 仓库（或直接上传这个文件夹内容到新仓库）
2. 打开 https://vercel.com/new
3. 选择「Import Git Repository」，连接你的 GitHub 仓库
4. Vercel 会自动识别这是 Next.js 项目
5. 点 Deploy，等 1-2 分钟完成

### 方式二：用命令行（需要 Node.js）

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 进入项目目录
cd furd-watermark-app

# 3. 登录
vercel login

# 4. 部署（首次会问几个问题，一路回车即可）
vercel --prod
```

### 连接云存储（必须做）

部署完成后，给项目添加 **Vercel Blob**：

1. 打开 Vercel 控制台 → 你的项目 → **Storage** 标签
2. 点 **Create Database** → 选 **Blob** → 选 **Hobby**（免费）
3. 创建完成后，Vercel 会自动把 `BLOB_READ_WRITE_TOKEN` 这个环境变量注入到项目
4. 回到 **Deployments**，点 **Redeploy** 重新部署一次（让环境变量生效）

完成后访问 `https://你的项目名.vercel.app` 就能用了。

## 本地开发（可选）

```bash
cp .env.example .env.local
# 填入你的 BLOB_READ_WRITE_TOKEN
npm install
npm run dev
```

## 免费额度说明

Vercel Hobby 计划（免费）：

- Blob 存储 10GB，流量 10GB/月
- 单文件上传上限约 4.5MB（产品图足够）
- 超出额度后才需要升级（每月 $20 起），对内部团队一般够用很久

## 目录结构

```
app/
  page.js            # 加水印页
  gallery/page.js    # 图库页
  admin/page.js      # 水印设置页
  api/
    save/route.js    # 保存图片到 Blob
    gallery/route.js # 图库列表 / 删除
    settings/route.js# 读取 / 保存水印设置
lib/
  watermark.js       # 浏览器端加水印核心
  settings.js        # 设置存取
  blob.js            # 图库存取
components/
  Nav.js             # 顶部导航
```
