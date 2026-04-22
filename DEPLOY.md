# 人体关节监测传感器仿真系统 - Zeabur 部署指南

> 部署平台：Zeabur（台湾/日本节点，国内访问速度快）
> 费用：免费

## 系统架构

```
用户浏览器 (:3000)
    │
    ├── /           → nginx → React 静态页面
    └── /api/*      → nginx → Flask 后端 (:5001)
```

## 部署步骤

### 第一步：推送代码到 GitHub

1. 打开 https://github.com 并登录（没有账号先注册）

2. 点击右上角 **+** → **New repository**
   - Repository name: `joint-sensor-system`
   - 不要勾选 "Add a README file"
   - 不需要 .gitignore（已有）
   - 点击 **Create repository**

3. 在本地项目目录执行以下命令（复制仓库创建后的命令）：

```bash
# 初始化 git（如果在项目根目录）
git init

# 添加所有文件（排除 node_modules 和 venv）
git add .
git reset --keep-front-end-and-venv
git add frontend/src frontend/public frontend/package.json frontend/package-lock.json backend/ Dockerfile .dockerignore deploy/ .gitignore

# 提交
git commit -m "Initial commit"

# 关联你的 GitHub 仓库（把 YOUR_USERNAME 换成你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/joint-sensor-system.git
git branch -M main

# 推送（会弹出登录提示）
git push -u origin main
```

> **注意**：推送时需要输入 GitHub 用户名和密码（或 Personal Access Token）。
> 如果提示密码失败，请使用 GitHub Settings → Developer settings → Personal access tokens 生成一个 token 作为密码。

### 第二步：在 Zeabur 上部署

1. 打开 https://zeabur.com 并登录
   - 推荐使用 GitHub 账号登录

2. 点击 **New Project** → **Deploy from GitHub**
   - 授权 Zeabur 访问你的 GitHub 账号
   - 选择 `joint-sensor-system` 仓库

3. Zeabur 会自动检测到 `Dockerfile`，直接开始构建部署

4. 等待构建完成（约 5-10 分钟），部署成功后你会获得一个 `.zeabur.app` 域名

### 第三步：访问你的应用

部署成功后，打开分配的 URL 即可访问，例如：
```
https://joint-sensor-system.zeabur.app
```

## 常用命令

### 查看日志
在 Zeabur 项目面板中点击 **Logs** 查看应用运行日志。

### 绑定自定义域名（可选）
Zeabur 免费版支持绑定一个自定义域名：
1. 项目设置 → Domains → Add Domain
2. 按提示在 DNS 中添加 CNAME 记录

## 故障排除

| 问题 | 解决方案 |
|------|----------|
| 构建失败 | 检查 Dockerfile 语法，确保 `frontend/` 和 `backend/` 目录存在 |
| 页面空白 | 确认 `frontend/build` 目录已正确复制到镜像中 |
| API 请求失败 | 检查 nginx 代理配置和 Flask 是否正常启动 |
| 502 错误 | 后端 Flask 可能未正常启动，查看日志排查 |

## 重新部署

代码推送到 GitHub 后，Zeabur 会自动检测并重新部署。也可以手动在 Zeabur 面板点击 **Redeploy**。
