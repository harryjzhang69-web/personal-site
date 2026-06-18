# Harry · 个人站打包 zip（备用，给手动拖拽部署用）
# 用法: .\deploy.ps1

$ErrorActionPreference = "Stop"

$zip = "harry-site.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }

Compress-Archive -Path index.html, assets -DestinationPath $zip -Force

$size = (Get-Item $zip).Length
Write-Host ""
Write-Host "✓ 打包完成: $zip ($size bytes)" -ForegroundColor Green
Write-Host ""
Write-Host "现在去 EdgeOne Pages 把它拖进去："
Write-Host "  👉 https://console.cloud.tencent.com/edgeone/pages" -ForegroundColor Yellow
Write-Host ""
explorer.exe (Get-Location).Path
