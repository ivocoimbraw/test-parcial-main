@echo on
SETLOCAL

SET "PROJECT_NAME=mi_flutter_app"

:: Crear el proyecto Flutter
echo === CREANDO PROYECTO FLUTTER ===
call flutter create %PROJECT_NAME%

:: Verifica que se haya creado correctamente
IF NOT EXIST "%PROJECT_NAME%\lib\main.dart" (
    echo ❌ El proyecto Flutter no fue creado correctamente.
    pause
    exit /b
)

:: Verifica que el archivo main.dart de reemplazo esté presente
IF NOT EXIST "main.dart" (
    echo ❌ No se encontró el archivo main.dart en esta carpeta.
    pause
    exit /b
)

:: Ir al proyecto
cd %PROJECT_NAME%

:: Regresar al directorio original
cd ..

:: Reemplazar main.dart
echo === REEMPLAZANDO main.dart ===
copy /Y "main.dart" "%PROJECT_NAME%\lib\main.dart"

echo ✅ Proyecto listo con google_fonts instalado.
echo cd %PROJECT_NAME%
echo flutter run

pause
ENDLOCAL
