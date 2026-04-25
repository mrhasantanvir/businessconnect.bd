$path = "e:\all project\businessconnect.bd\src"
$files = Get-ChildItem -Path $path -Filter *.tsx -Recurse

foreach ($file in $files) {
    $fullName = $file.FullName
    $content = [System.IO.File]::ReadAllText($fullName)
    
    # Fix invisible text on light backgrounds
    $newContent = $content -replace 'bg-white(?=.*text-white)', 'bg-white text-slate-900'
    $newContent = $newContent -replace 'bg-slate-50(?=.*text-white)', 'bg-slate-50 text-slate-900'
    
    # Clean up double classes
    $newContent = $newContent -replace 'text-white text-slate-900', 'text-slate-900'
    $newContent = $newContent -replace 'text-slate-900 text-white', 'text-slate-900'
    
    if ($content -ne $newContent) {
        [System.IO.File]::WriteAllText($fullName, $newContent)
        Write-Host "Visibility Fixed: $fullName"
    }
}
