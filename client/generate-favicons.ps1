# PowerShell Script to Generate Favicons from logo-1.png
# สคริปต์สำหรับสร้าง favicon จาก logo-1.png

param(
    [string]$SourceImage = "src\assets\images\logo-1.png",
    [string]$OutputDir = "public"
)

# Load .NET assemblies for image processing
Add-Type -AssemblyName System.Drawing

Write-Host "🎨 กำลังสร้าง Favicon จาก $SourceImage..." -ForegroundColor Cyan

# Define sizes to generate
$sizes = @(
    @{Name="favicon-16x16.png"; Size=16},
    @{Name="favicon-32x32.png"; Size=32},
    @{Name="apple-touch-icon-120x120.png"; Size=120},
    @{Name="apple-touch-icon-152x152.png"; Size=152},
    @{Name="apple-touch-icon.png"; Size=180},
    @{Name="android-chrome-192x192.png"; Size=192},
    @{Name="android-chrome-512x512.png"; Size=512}
)

# Check if source image exists
if (-not (Test-Path $SourceImage)) {
    Write-Host "❌ ไม่พบไฟล์ต้นฉบับ: $SourceImage" -ForegroundColor Red
    exit 1
}

# Create output directory if it doesn't exist
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Load source image
$sourceImg = [System.Drawing.Image]::FromFile((Resolve-Path $SourceImage))

Write-Host "📏 ขนาดต้นฉบับ: $($sourceImg.Width)x$($sourceImg.Height)" -ForegroundColor Gray

# Generate each size
foreach ($config in $sizes) {
    $outputPath = Join-Path $OutputDir $config.Name
    $size = $config.Size
    
    Write-Host "  ✓ สร้าง $($config.Name) ($size x $size)" -ForegroundColor Green
    
    # Create new bitmap with specified size
    $newImg = New-Object System.Drawing.Bitmap $size, $size
    $graphics = [System.Drawing.Graphics]::FromImage($newImg)
    
    # Set high quality rendering
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # Draw resized image
    $graphics.DrawImage($sourceImg, 0, 0, $size, $size)
    
    # Save as PNG
    $newImg.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $graphics.Dispose()
    $newImg.Dispose()
}

# Cleanup source image
$sourceImg.Dispose()

Write-Host ""
Write-Host "✅ สร้าง Favicon เสร็จสิ้น!" -ForegroundColor Green
Write-Host "📁 ไฟล์ทั้งหมดอยู่ที่: $OutputDir" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 ขั้นตอนถัดไป:" -ForegroundColor Cyan
Write-Host "  1. สร้าง favicon.ico จาก favicon-16x16.png และ favicon-32x32.png"
Write-Host "     → ใช้เครื่องมือออนไลน์: https://favicon.io/favicon-converter/"
Write-Host "  2. สร้าง og-image.png (1200x630) สำหรับ Social Media"
Write-Host "  3. รีสตาร์ท dev server"
Write-Host ""
