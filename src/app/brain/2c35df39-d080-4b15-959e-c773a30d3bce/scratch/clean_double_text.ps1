$paths = @(
    "e:\all project\businessconnect.bd\src\app\merchant", 
    "e:\all project\businessconnect.bd\src\app\dashboard",
    "e:\all project\businessconnect.bd\src\components\merchant",
    "e:\all project\businessconnect.bd\src\components\layout",
    "e:\all project\businessconnect.bd\src\components\shared",
    "e:\all project\businessconnect.bd\src\components\ui"
)

foreach ($path in $paths) {
    if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -Filter *.tsx -Recurse

        foreach ($file in $files) {
            $fullName = $file.FullName
            $content = [System.IO.File]::ReadAllText($fullName)
            
            # Remove text-white if we already added a dark text class
            $newContent = $content -replace 'text-slate-900 text-white', 'text-slate-900'
            $newContent = $newContent -replace 'text-white text-slate-900', 'text-slate-900'
            $newContent = $newContent -replace 'text-indigo-600 text-white', 'text-indigo-600'
            $newContent = $newContent -replace 'text-white text-indigo-600', 'text-indigo-600'
            
            [System.IO.File]::WriteAllText($fullName, $newContent)
        }
    }
}
