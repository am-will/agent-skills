#!/usr/bin/env pwsh
<#
.SYNOPSIS
    讀取 Codex CLI 的父階段設定（model 和 reasoning level）。

.DESCRIPTION
    從 ~/.codex/config.toml 解析設定，支援：
    1. Profile 機制：若設定了 profile，優先使用 [profiles.xxx] 區段的值
    2. 頂層設定：作為 profile 未設定時的回退
    3. 預設值：當設定檔不存在或缺少設定時使用

    輸出兩行純文字（供呼叫端解析）：
    - 第 1 行：model 名稱
    - 第 2 行：model_reasoning_effort 等級

.OUTPUTS
    兩行文字，分別為 model 和 reasoning level。

.EXAMPLE
    $settings = & .\codex-parent-settings.ps1
    $MODEL = $settings[0]
    $REASONING = $settings[1]

.NOTES
    Exit codes:
    - 0: 成功（包含使用預設值的情況）
    - 1: 嚴重錯誤（如設定檔格式錯誤無法解析）
#>

$ErrorActionPreference = "Stop"

# 預設值
$defaultModel = "gpt-5.2-codex"
$defaultReasoning = "medium"

# 初始化變數
$model = ""
$reasoning = ""
$profile = ""

# 設定檔路徑
$configPath = Join-Path $HOME ".codex\config.toml"

# 輔助函式：從 TOML 行提取引號內的值
function Get-QuotedValue {
    param(
        [string]$Line,
        [string]$Key
    )
    $pattern = "^\s*$Key\s*=\s*""([^""]*)"""
    if ($Line -match $pattern) {
        return $matches[1]
    }
    return $null
}

# 主要解析邏輯
if (Test-Path -LiteralPath $configPath) {
    try {
        $lines = Get-Content -LiteralPath $configPath -Encoding UTF8

        # 階段 1：讀取頂層 profile 設定
        $section = $null
        foreach ($line in $lines) {
            $trim = $line.Trim()
            if ($trim -match '^\s*\[(.+?)\]\s*$') {
                $section = $matches[1]
                continue
            }
            # 僅在頂層（非 section 內）尋找 profile
            if ($section) {
                continue
            }
            if (-not $profile) {
                $value = Get-QuotedValue -Line $trim -Key "profile"
                if ($value) {
                    $profile = $value
                    break
                }
            }
        }

        # 階段 2：若有 profile，優先從 [profiles.xxx] 區段讀取
        if ($profile) {
            $inProfile = $false
            foreach ($line in $lines) {
                $trim = $line.Trim()
                if ($trim -match '^\s*\[(.+?)\]\s*$') {
                    $sectionName = $matches[1]
                    if ($sectionName -match '^profiles\.(.+)$') {
                        $sectionProfile = $matches[1].Trim()
                        # 移除可能的引號
                        if ($sectionProfile -match '^"(.*)"$') {
                            $sectionProfile = $matches[1]
                        }
                        elseif ($sectionProfile -match "^'(.*)'$") {
                            $sectionProfile = $matches[1]
                        }
                        $inProfile = ($sectionProfile -eq $profile)
                    }
                    else {
                        $inProfile = $false
                    }
                    continue
                }
                if (-not $inProfile) {
                    continue
                }
                if (-not $model) {
                    $value = Get-QuotedValue -Line $trim -Key "model"
                    if ($value) {
                        $model = $value
                        continue
                    }
                }
                if (-not $reasoning) {
                    $value = Get-QuotedValue -Line $trim -Key "model_reasoning_effort"
                    if ($value) {
                        $reasoning = $value
                        continue
                    }
                }
                if ($model -and $reasoning) {
                    break
                }
            }
        }

        # 階段 3：回退到頂層設定
        $section = $null
        foreach ($line in $lines) {
            $trim = $line.Trim()
            if ($trim -match '^\s*\[(.+?)\]\s*$') {
                $section = $matches[1]
                continue
            }
            # 僅在頂層讀取
            if ($section) {
                continue
            }
            if (-not $model) {
                $value = Get-QuotedValue -Line $trim -Key "model"
                if ($value) {
                    $model = $value
                    continue
                }
            }
            if (-not $reasoning) {
                $value = Get-QuotedValue -Line $trim -Key "model_reasoning_effort"
                if ($value) {
                    $reasoning = $value
                    continue
                }
            }
        }
    }
    catch {
        Write-Error "無法解析設定檔 $configPath : $_"
        exit 1
    }
}
else {
    # 設定檔不存在，使用預設值（這不是錯誤）
    Write-Warning "設定檔不存在: $configPath，使用預設值"
}

# 套用預設值
if (-not $model) {
    $model = $defaultModel
}

$validReasoning = @("none", "minimal", "low", "medium", "high", "xhigh")
if (-not $reasoning -or -not ($validReasoning -contains $reasoning)) {
    $reasoning = $defaultReasoning
}

# 輸出結果（兩行）
Write-Output $model
Write-Output $reasoning

exit 0
