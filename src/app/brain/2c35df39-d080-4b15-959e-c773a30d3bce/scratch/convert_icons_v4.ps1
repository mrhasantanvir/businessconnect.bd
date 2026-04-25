$iconsDir = "e:\all project\businessconnect.bd\src\new_ui_design_system\icons"
$svgFiles = Get-ChildItem -Path $iconsDir -Filter *.svg

foreach ($file in $svgFiles) {
    $name = $file.BaseName
    $content = [System.IO.File]::ReadAllText($file.FullName)
    
    if ([string]::IsNullOrWhiteSpace($content)) {
        # Default empty SVG if file is empty
        $content = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}></svg>'
    } else {
        # Remove xml header if exists
        $content = $content -replace '<\?xml.*?\?>', ''
        # Clean up svg tag
        $content = $content -replace '<svg', '<svg {...props}'
        
        # Convert class to className
        $content = $content -replace 'class=', 'className='
        
        # Convert kabab-case to camelCase for React props
        $content = $content -replace 'fill-rule', 'fillRule'
        $content = $content -replace 'clip-rule', 'clipRule'
        $content = $content -replace 'stroke-width', 'strokeWidth'
        $content = $content -replace 'stroke-linecap', 'strokeLinecap'
        $content = $content -replace 'stroke-linejoin', 'strokeLinejoin'
        $content = $content -replace 'stop-color', 'stopColor'
        $content = $content -replace 'stop-opacity', 'stopOpacity'
        $content = $content -replace 'stroke-miterlimit', 'strokeMiterlimit'
        $content = $content -replace 'fill-opacity', 'fillOpacity'
    }

    $componentName = ""
    # Simple snake_case/kebab-case to PascalCase
    $parts = $name -split '[-_]'
    foreach ($part in $parts) {
        if ($part.Length -gt 0) {
            $componentName += $part.Substring(0,1).ToUpper() + $part.Substring(1)
        }
    }
    
    # Append "Icon" if not already present at the end
    if (-not $componentName.EndsWith("Icon")) {
        $componentName += "Icon"
    }

    # Special cases for names starting with numbers or other oddities
    if ($componentName -match '^\d') { $componentName = "Icon" + $componentName }

    $tsxContent = @"
import React from "react";

export const $($componentName) = (props: React.SVGProps<SVGSVGElement>) => (
    $content
);
"@
    [System.IO.File]::WriteAllText("$iconsDir\$name.tsx", $tsxContent)
    Write-Host "Converted: $name.svg -> $componentName in $name.tsx"
}
