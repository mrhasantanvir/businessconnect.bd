$iconsDir = "e:\all project\businessconnect.bd\src\new_ui_design_system\icons"
$svgFiles = Get-ChildItem -Path $iconsDir -Filter *.svg

foreach ($file in $svgFiles) {
    $name = $file.BaseName
    $content = [System.IO.File]::ReadAllText($file.FullName)
    
    # Remove xml header if exists
    $content = $content -replace '<\?xml.*?\?>', ''
    # Clean up svg tag
    $content = $content -replace '<svg', '<svg {...props}'
    
    # Convert kabab-case to camelCase for React props
    $content = $content -replace 'fill-rule', 'fillRule'
    $content = $content -replace 'clip-rule', 'clipRule'
    $content = $content -replace 'stroke-width', 'strokeWidth'
    $content = $content -replace 'stroke-linecap', 'strokeLinecap'
    $content = $content -replace 'stroke-linejoin', 'strokeLinejoin'
    $content = $content -replace 'stop-color', 'stopColor'
    $content = $content -replace 'stop-opacity', 'stopOpacity'

    $componentName = ""
    # Simple snake_case/kebab-case to PascalCase
    $parts = $name -split '[-_]'
    foreach ($part in $parts) {
        $componentName += $part.Substring(0,1).ToUpper() + $part.Substring(1)
    }
    
    $tsxContent = @"
import React from "react";

export const $($componentName)Icon = (props: React.SVGProps<SVGSVGElement>) => (
    $content
);
"@
    [System.IO.File]::WriteAllText("$iconsDir\$name.tsx", $tsxContent)
    Write-Host "Converted: $name.svg -> $name.tsx"
}
