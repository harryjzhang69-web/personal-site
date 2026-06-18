# ============================================
# Harry · 个人站一键部署脚本
# 用法（在 personal_site 目录下）：
#   .\push.ps1                    # 用默认 commit 信息
#   .\push.ps1 "更新了首页文案"     # 自定义 commit 信息
# ============================================

param(
    [string]$Message = "update site"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🚀 Harry · 一键发布" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

# 1. 检查 git 是否安装
try {
    $gitVersion = git --version 2>&1
    Write-Host "✓ Git 已安装: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git 没装！请先去这里下载安装：" -ForegroundColor Red
    Write-Host "  https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  装完后重启终端再运行此脚本。" -ForegroundColor Yellow
    exit 1
}

# 2. 检查是否已是 git 仓库
if (-not (Test-Path ".git")) {
    Write-Host ""
    Write-Host "📦 首次运行 — 初始化 Git 仓库..." -ForegroundColor Cyan

    # 配置用户（如果没配过）
    $email = git config --global user.email
    if (-not $email) {
        $userEmail = Read-Host "  你的 GitHub 注册邮箱"
        $userName = Read-Host "  你的 GitHub 用户名"
        git config --global user.email "$userEmail"
        git config --global user.name "$userName"
        Write-Host "  ✓ Git 用户已配置" -ForegroundColor Green
    }

    git init -b main | Out-Null
    git add . | Out-Null
    git commit -m "first commit: harry's personal site" | Out-Null
    Write-Host "  ✓ 已创建首次 commit" -ForegroundColor Green

    Write-Host ""
    Write-Host "📌 现在去 GitHub 创建一个空仓库（不要勾选 README/.gitignore）" -ForegroundColor Yellow
    Write-Host "   👉 https://github.com/new" -ForegroundColor Yellow
    Write-Host ""
    $repoUrl = Read-Host "  把仓库地址粘贴进来（形如 https://github.com/xxx/personal-site.git）"

    if (-not $repoUrl) {
        Write-Host "  ✗ 没填地址，已退出。下次直接跑 .\push.ps1 继续。" -ForegroundColor Red
        exit 1
    }

    git remote add origin $repoUrl
    Write-Host "  ✓ 已关联远程仓库: $repoUrl" -ForegroundColor Green

    Write-Host ""
    Write-Host "📤 推送到 GitHub..." -ForegroundColor Cyan
    git push -u origin main

    Write-Host ""
    Write-Host "🎉 首次推送成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步 — 把 GitHub 仓库关联到 EdgeOne Pages：" -ForegroundColor Yellow
    Write-Host "  1. 打开 https://console.cloud.tencent.com/edgeone/pages" -ForegroundColor Yellow
    Write-Host "  2. 新建项目 → 选「从 Git 导入」→ 授权 GitHub → 选你的仓库" -ForegroundColor Yellow
    Write-Host "  3. 框架选「无框架（静态）」、构建命令留空、输出目录填「.」" -ForegroundColor Yellow
    Write-Host "  4. 点部署 → 等几秒 → 拿到永久 URL" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "之后任何修改，只需运行：.\push.ps1 ""你的更新说明""" -ForegroundColor Cyan
    exit 0
}

# 3. 后续更新流程
Write-Host ""
Write-Host "📝 检查改动..." -ForegroundColor Cyan
$changes = git status --porcelain
if (-not $changes) {
    Write-Host "  ⚠ 没有需要提交的改动。" -ForegroundColor Yellow
    exit 0
}

Write-Host "  改动文件:" -ForegroundColor Gray
git status --short

Write-Host ""
Write-Host "📤 提交并推送..." -ForegroundColor Cyan
git add .
git commit -m "$Message"
git push

Write-Host ""
Write-Host "✓ 已推送！EdgeOne 会自动检测并几秒内更新网站。" -ForegroundColor Green
Write-Host ""
