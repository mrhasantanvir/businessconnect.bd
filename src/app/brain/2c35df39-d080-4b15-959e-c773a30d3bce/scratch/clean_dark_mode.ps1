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
            
            # Remove dark: classes
            $newContent = $content -replace 'dark:[^ \"'']+', ''
            
            # Replace hardcoded dark backgrounds
            $newContent = $newContent -replace 'bg-\[#0F172A\]', 'bg-white border border-slate-100'
            $newContent = $newContent -replace 'bg-\[#121212\]', 'bg-white'
            $newContent = $newContent -replace 'bg-\[#1A1A1A\]', 'bg-slate-50'
            $newContent = $newContent -replace 'bg-\[#0A0A0A\]', 'bg-white'
            
            [System.IO.File]::WriteAllText($fullName, $newContent)
        }
    }
}
