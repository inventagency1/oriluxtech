# 🚀 ORILUXCHAIN + VERALIX - START ALL
# Script para iniciar todo el ecosistema

Write-Host "🚀 INICIANDO ORILUXCHAIN + VERALIX" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
$oriluxPath = "C:\Users\Sebastian\Desktop\Oriluxchain"
$veralixPath = "$oriluxPath\veralix-crestchain\veralix-crestchain-1.0"

if (-not (Test-Path $oriluxPath)) {
    Write-Host "❌ Error: No se encuentra Oriluxchain en $oriluxPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $veralixPath)) {
    Write-Host "❌ Error: No se encuentra Veralix en $veralixPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Directorios encontrados" -ForegroundColor Green
Write-Host ""

# Función para verificar si un puerto está en uso
function Test-Port {
    param($Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
    return $connection
}

# Verificar puertos
Write-Host "🔍 Verificando puertos..." -ForegroundColor Yellow

if (Test-Port 5000) {
    Write-Host "⚠️  Puerto 5000 ya está en uso (Oriluxchain)" -ForegroundColor Yellow
    $response = Read-Host "¿Deseas continuar de todos modos? (s/n)"
    if ($response -ne "s") {
        exit 0
    }
}

if (Test-Port 5173) {
    Write-Host "⚠️  Puerto 5173 ya está en uso (Veralix)" -ForegroundColor Yellow
    $response = Read-Host "¿Deseas continuar de todos modos? (s/n)"
    if ($response -ne "s") {
        exit 0
    }
}

Write-Host ""
Write-Host "📋 PLAN DE INICIO:" -ForegroundColor Cyan
Write-Host "  1. Iniciar Oriluxchain (Backend) en puerto 5000" -ForegroundColor White
Write-Host "  2. Iniciar Veralix (Frontend) en puerto 5173" -ForegroundColor White
Write-Host "  3. Mostrar URLs de acceso" -ForegroundColor White
Write-Host ""

# Preguntar si desea usar ngrok
Write-Host "🌐 ¿Deseas iniciar ngrok para exponer Oriluxchain? (s/n)" -ForegroundColor Yellow
Write-Host "   (Necesario para que Supabase pueda enviar webhooks)" -ForegroundColor Gray
$useNgrok = Read-Host

Write-Host ""
Write-Host "🚀 Iniciando servicios..." -ForegroundColor Cyan
Write-Host ""

# Iniciar Oriluxchain en una nueva ventana
Write-Host "1️⃣  Iniciando Oriluxchain..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$oriluxPath'; Write-Host '🔗 ORILUXCHAIN BACKEND' -ForegroundColor Cyan; Write-Host '======================' -ForegroundColor Cyan; Write-Host ''; python start_with_veralix.py"

Start-Sleep -Seconds 3

# Iniciar Veralix en una nueva ventana
Write-Host "2️⃣  Iniciando Veralix..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$veralixPath'; Write-Host '🎨 VERALIX FRONTEND' -ForegroundColor Magenta; Write-Host '===================' -ForegroundColor Magenta; Write-Host ''; npm run dev"

Start-Sleep -Seconds 2

# Iniciar ngrok si se solicitó
if ($useNgrok -eq "s") {
    Write-Host "3️⃣  Iniciando ngrok..." -ForegroundColor Green
    
    # Verificar si ngrok está instalado
    $ngrokPath = Get-Command ngrok -ErrorAction SilentlyContinue
    
    if ($ngrokPath) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🌐 NGROK TUNNEL' -ForegroundColor Yellow; Write-Host '===============' -ForegroundColor Yellow; Write-Host ''; Write-Host '⚠️  IMPORTANTE: Copia la URL https://xxx.ngrok.io' -ForegroundColor Yellow; Write-Host '   y actualízala en veralix-crestchain-1.0/.env' -ForegroundColor Yellow; Write-Host '   como VITE_ORILUXCHAIN_URL' -ForegroundColor Yellow; Write-Host ''; ngrok http 5000"
    } else {
        Write-Host "⚠️  ngrok no está instalado o no está en PATH" -ForegroundColor Yellow
        Write-Host "   Descárgalo de: https://ngrok.com/download" -ForegroundColor Gray
        Write-Host "   O usa: npx localtunnel --port 5000" -ForegroundColor Gray
    }
}

Start-Sleep -Seconds 5

# Mostrar resumen
Write-Host ""
Write-Host "✅ SERVICIOS INICIADOS" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 URLs de acceso:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📊 Oriluxchain Dashboard:" -ForegroundColor White
Write-Host "     http://localhost:5000" -ForegroundColor Yellow
Write-Host "     Usuario: admin" -ForegroundColor Gray
Write-Host "     Password: admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "  🎨 Veralix Frontend:" -ForegroundColor White
Write-Host "     http://localhost:5173" -ForegroundColor Yellow
Write-Host ""

if ($useNgrok -eq "s") {
    Write-Host "  🌐 Túnel Público (ngrok):" -ForegroundColor White
    Write-Host "     Verifica la ventana de ngrok para la URL" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  ⚠️  IMPORTANTE:" -ForegroundColor Red
    Write-Host "     1. Copia la URL de ngrok (https://xxx.ngrok.io)" -ForegroundColor White
    Write-Host "     2. Actualiza veralix-crestchain-1.0/.env:" -ForegroundColor White
    Write-Host "        VITE_ORILUXCHAIN_URL=https://xxx.ngrok.io" -ForegroundColor Gray
    Write-Host "     3. Reinicia Veralix (Ctrl+C y npm run dev)" -ForegroundColor White
    Write-Host ""
}

Write-Host "📝 Próximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Abre http://localhost:5173 en tu navegador" -ForegroundColor White
Write-Host "  2. Navega a la sección de Certificados" -ForegroundColor White
Write-Host "  3. Crea un certificado de prueba" -ForegroundColor White
Write-Host "  4. Verifica que aparece en Oriluxchain" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentación completa:" -ForegroundColor Cyan
Write-Host "   $oriluxPath\INICIO_RAPIDO.md" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 Para detener todo:" -ForegroundColor Red
Write-Host "   Cierra las ventanas de PowerShell que se abrieron" -ForegroundColor White
Write-Host ""

# Abrir navegador automáticamente
Write-Host "🌐 Abriendo navegador..." -ForegroundColor Green
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "✨ ¡Todo listo! El ecosistema está corriendo." -ForegroundColor Green
Write-Host ""
Write-Host "Presiona cualquier tecla para cerrar esta ventana..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
