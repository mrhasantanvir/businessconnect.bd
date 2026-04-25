$files = Get-ChildItem -Recurse -Include *.ts,*.tsx -Path src | Select-String -Pattern 'import { prisma } from "@/lib/db"' | Select-Object -ExpandProperty Path -Unique

foreach ($file in $files) {
    Write-Host "Updating $file ..."
    $content = Get-Content $file -Raw
    $newContent = $content -replace 'import { prisma } from "@/lib/db"', 'import { db as prisma } from "@/lib/db"'
    Set-Content -Path $file -Value $newContent -NoNewline
}

Write-Host "Refactor Complete for $($files.Count) files."
