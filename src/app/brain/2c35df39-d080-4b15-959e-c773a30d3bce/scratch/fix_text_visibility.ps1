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
            
            # Fix invisible text on light backgrounds
            # Pattern: bg-white...text-white or bg-slate-50...text-white
            $newContent = $content -replace 'bg-white(?=.*text-white)', 'bg-white text-slate-900'
            $newContent = $newContent -replace 'bg-slate-50(?=.*text-white)', 'bg-slate-50 text-slate-900'
            
            # Clean up the double classes we might have created
            $newContent = $newContent -replace 'text-white text-slate-900', 'text-slate-900'
            
            [System.IO.File]::WriteAllText($fullName, $newContent)
        }
    }
}
