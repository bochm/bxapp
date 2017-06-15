@echo off
rd ..\deployee /s/q
node r.js -o build.js
Xcopy ..\jsons ..\deployee\jsons /i /e /f
Xcopy ..\pages ..\deployee\pages /i /e /f
copy ..\*.html ..\deployee
copy ..\*.js ..\deployee
pause