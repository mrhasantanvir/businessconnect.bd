$path = "e:\all project\businessconnect.bd\src"
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
    
    # Fix common invisible text patterns (white text on what used to be dark but now is light)
    $newContent = $newContent -replace 'bg-white(?=.*text-white)', 'bg-white text-slate-900'
    $newContent = $newContent -replace 'bg-slate-50(?=.*text-white)', 'bg-slate-50 text-slate-900'
    
    # Clean up double classes
    $newContent = $newContent -replace 'text-white text-slate-900', 'text-slate-900'
    $newContent = $newContent -replace 'text-slate-900 text-white', 'text-slate-900'
    
    # Only write if changed
    if ($content -ne $newContent) {
        [System.IO.File]::WriteAllText($fullName, $newContent)
        Write-Host "Updated: $fullName"
    }
}
