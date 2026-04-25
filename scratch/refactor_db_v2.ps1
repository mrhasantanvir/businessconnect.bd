$files = Get-ChildItem -Recurse -Include *.ts,*.tsx -Path src | Select-String -Pattern 'import { prisma } from "@/lib/db"' | Select-Object -ExpandProperty Path -Unique

foreach ($file in $files) {
    Write-Host "Updating $file ..."
    $content = [System.IO.File]::ReadAllText($file)
    $newContent = $content.Replace('import { prisma } from "@/lib/db"', 'import { db as prisma } from "@/lib/db"')
    [System.IO.File]::WriteAllText($file, $newContent)
}

Write-Host "Refactor Complete for $($files.Count) files."
