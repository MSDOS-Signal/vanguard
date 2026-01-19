# 部署指南 (Serverless / 免费方案)

这篇指南将帮助你将项目部署到生产环境，且**无需购买服务器**。我们将使用 **Vercel** 托管前端和后端，**TiDB Cloud** 托管数据库，**Cloudinary** 托管上传的图片。

## 1. 准备工作

### 1.1 注册账号
- [Vercel](https://vercel.com/signup) (GitHub 账号登录)
- [TiDB Cloud](https://tidbcloud.com/free-trial) (免费 Serverless MySQL)
- [Cloudinary](https://cloudinary.com/users/register/free) (免费图片托管)

### 1.2 数据库 (TiDB Cloud)
1. 登录 TiDB Cloud 并创建一个免费的 Serverless Cluster。
2. 创建成功后，点击 "Connect" 获取连接信息。
3. 选择 "Connect with General" 或 "Node.js"。
4. 记下以下信息：
   - Host
   - Port (通常是 4000)
   - User
   - Password
   - Database Name (默认可能是 test，建议新建一个如 `vanguard`)

### 1.3 图片存储 (Cloudinary)
1. 登录 Cloudinary Console。
2. 在 Dashboard 页面，找到 "Product Environment Credentials"。
3. 记下：
   - Cloud Name
   - API Key
   - API Secret

## 2. 部署步骤

### 2.1 推送代码到 GitHub
确保你的代码已经提交并推送到 GitHub 仓库。

### 2.2 在 Vercel 创建项目
1. 登录 Vercel Dashboard，点击 "Add New..." -> "Project"。
2. 导入你的 GitHub 仓库。
3. **关键步骤**：配置 Environment Variables (环境变量)。
   在 "Environment Variables" 部分，添加以下变量：

   **数据库配置 (来自 TiDB):**
   - `DB_HOST`: (你的 TiDB Host)
   - `DB_PORT`: 4000
   - `DB_USER`: (你的 TiDB User)
   - `DB_PASSWORD`: (你的 TiDB Password)
   - `DB_NAME`: vanguard (或你创建的数据库名)
   
   **图片存储配置 (来自 Cloudinary):**
   - `CLOUDINARY_CLOUD_NAME`: (你的 Cloud Name)
   - `CLOUDINARY_API_KEY`: (你的 API Key)
   - `CLOUDINARY_API_SECRET`: (你的 API Secret)
   
   **其他配置:**
   - `NODE_ENV`: production
   - `JWT_SECRET`: (随机生成一个长字符串，用于加密)

4. 点击 "Deploy"。

## 3. 常见问题

### 图片上传不工作？
确保你在 Vercel 的环境变量中正确配置了 Cloudinary 的三个参数。由于 Vercel 是 Serverless 环境，不支持本地文件存储，我们已经修改了代码 (`routes/upload.js`)，当检测到 Cloudinary 配置时会自动切换到云存储。

### 数据库连接失败？
TiDB Cloud 需要 SSL 连接。Sequelize 默认配置通常可以工作，但如果遇到 `ECONNREFUSED`，请检查 TiDB 的 IP 白名单设置（通常 Serverless 版允许所有 IP，或者你需要点击 "Allow Access from Anywhere"）。

### 部署后 API 404？
我们已经添加了 `vercel.json` 配置文件，它会将 `/api/*` 的请求路由到 `server.js`。如果遇到问题，请检查 Vercel 的 Functions 日志。

## 4. 本地开发
在本地开发时，你可以创建一个 `.env` 文件（不要提交到 GitHub），填入上述变量，这样本地也可以连接云数据库和云存储进行测试。

```env
DB_HOST=...
DB_USER=...
...
CLOUDINARY_CLOUD_NAME=...
...
```
