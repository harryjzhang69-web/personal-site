# 一次到位 · 上线全流程清单

> ⏱ 总时间：30 分钟
> 💰 成本：¥0（域名以后再买，先不买）

---

## ✅ 第 0 步：你已经完成的

- [x] 网站源代码（`index.html` + `assets/`）
- [x] `.gitignore`（忽略不该上传的文件）
- [x] `push.ps1`（一键 git 推送脚本）
- [x] `deploy.ps1`（备用：打 zip 手动上传）

---

## 🟡 第 1 步：装 Git（5 分钟）

1. 下载：https://git-scm.com/download/win
2. **一路点 Next**（默认设置就够，别瞎改）
3. 装完后**重启 PowerShell / 终端**
4. 验证：开个新终端跑 `git --version`，看到版本号即成功

---

## 🟡 第 2 步：注册 GitHub（5 分钟）

1. 注册：https://github.com/signup
2. 用一个**永久能收到的邮箱**（建议 Gmail / Outlook，不要 QQ 邮箱）
3. 用户名建议：`harryjzhang` / `harry-jz` / `xuanjing` 这种，**以后就是你的身份**
4. **打开邮箱激活账号**

---

## 🟡 第 3 步：创建空仓库（2 分钟）

1. 登录 GitHub 后打开：https://github.com/new
2. 填：
   - **Repository name**: `personal-site`
   - **Description**: `My personal site`
   - **Public** ✅（公开，免费且能让别人看你代码 → 加分项）
   - **❌ 不要勾** Add a README
   - **❌ 不要勾** Add .gitignore
   - **❌ 不要勾** Choose a license
3. 点 **Create repository**
4. 跳出来一个页面，**复制最上面那个仓库地址**，类似：
   ```
   https://github.com/你的用户名/personal-site.git
   ```

---

## ✅ 第 4 步：一键推送（自动化）

在 `personal_site` 目录打开 PowerShell，运行：

```powershell
.\push.ps1
```

脚本会自动：
- 检查 Git 是否装好
- 让你输入 GitHub 邮箱和用户名（首次配置）
- 让你粘贴上一步的仓库地址
- 自动 `git init / add / commit / push`
- **首次推送可能让你登录 GitHub**（弹浏览器，授权一下）

推送成功后，刷新你的 GitHub 仓库页面，能看到全部文件 ✅

---

## 🟡 第 5 步：EdgeOne Pages 关联仓库（3 分钟）

1. 打开：https://console.cloud.tencent.com/edgeone/pages
2. **登录腾讯云**（用微信扫码即可）
3. 点 **新建项目**
4. 选 **「从 Git 导入」**（不是 "上传"）
5. **授权 GitHub**（弹窗 → Authorize → 选你的账号 → 选 `personal-site` 仓库）
6. 配置（重点）：
   - **项目名**: `harry-site`
   - **生产分支**: `main`
   - **框架**: 选 `无框架` 或 `Static`
   - **构建命令**: 留空
   - **输出目录**: `.`（一个点，表示根目录）
7. 点 **开始部署**
8. 等 30 秒 → 拿到 URL，类似：
   ```
   https://harry-site-xxxxx.edgeone.app
   ```

🎉 **网站永久上线！**

---

## ✅ 第 6 步：以后怎么更新

改完 `index.html` 任何东西后，在 PowerShell 运行：

```powershell
.\push.ps1 "更新了关于我"
```

🔁 **几秒后网站自动更新**。EdgeOne 检测到 GitHub 有新 push 就会自动重新部署。

---

## 🌐 选做：买自己的域名（一两周内）

EdgeOne 的 `xxx.edgeone.app` 是临时域名，永久免费，但**不显得专业**。

想要 `harryzhang.com` 这种专属域名：

1. 去 https://buy.cloud.tencent.com/domain 搜你想要的域名
2. 推荐 `.com / .me / .dev`，¥55-90/年
3. 买完去 EdgeOne Pages → 你的项目 → "自定义域名" → 添加
4. 按提示在域名管理里改 CNAME 解析
5. 5-15 分钟后生效

⚠️ **国内访问需要备案**（约 7-30 天），但 `.app / .dev` 海外域名免备案。

---

## 🆘 卡住了怎么办？

- **Git 装完终端找不到 git** → 重启电脑，或重启所有终端窗口
- **push 时让登录** → 弹出来的浏览器窗口里点 "Authorize"
- **EdgeOne 找不到 GitHub 仓库** → 在 GitHub 设置里给 EdgeOne App 授权
- **任何错误信息** → 截图发给我，我具体帮你看

---

## 📝 文案替换提醒（部署后再做也行）

打开 `index.html`，搜索 `{{` 替换为：

| 占位符 | 你填的 |
|---|---|
| `{{your@email.com}}` | _________________ |
| `{{wechat_id}}` | _________________ |
| `{{玄镜 Harry}}` | _________________ |
| `{{https://www.xiaohongshu.com/...}}` | _________________ |
| `{{https://www.zhihu.com/people/xxx}}` | _________________ |
| `{{https://github.com/xxx}}` | _________________ |
| `{{Shenzhen}}` | _________________ |
| `{{2026.06.18}}` | （自动填今天日期即可） |

改完跑 `.\push.ps1 "替换文案"` 就发出去了。
