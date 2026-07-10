<#
.SYNOPSIS
    Demonstrates Chartres Cathedral stained glass theme token coloring in PowerShell.
.DESCRIPTION
    This script provides a comprehensive showcase of PowerShell syntax elements
    including comment-based help, parameter declarations, functions, classes,
    enums, error handling, pipelines, and hashtables — all themed around the
    Chartres Blue stained glass aesthetic.
.PARAMETER WindowName
    The name of a stained glass window panel (e.g., "Notre-Dame-de-la-Belle-Verriere").
.PARAMETER VerboseLogging
    Switch to enable detailed diagnostic output during execution.
.EXAMPLE
    .\powershell-example.ps1 -WindowName "Rose du Nord" -VerboseLogging
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $false, Position = 0)]
    [ValidateNotNullOrEmpty()]
    [string]$WindowName = "Rose du Sud",

    [Parameter(Mandatory = $false)]
    [switch]$VerboseLogging
)

# ─── Enums ───────────────────────────────────────────────────────────────

enum GlassColor {
    ChartresBlue
    DeepAzure
    RubyRed
    AmberGold
    EmeraldGreen
    AmethystPurple
    GrisailleWhite
}

enum LightSource {
    Morning = 1
    Noon    = 2
    Dusk    = 3
}

# ─── Class ───────────────────────────────────────────────────────────────

class StainedGlassPanel {
    [string]$Name
    [GlassColor]$PrimaryColor
    [int]$YearInstalled
    [bool]$IsIlluminated

    StainedGlassPanel([string]$name, [GlassColor]$color, [int]$year) {
        $this.Name = $name
        $this.PrimaryColor = $color
        $this.YearInstalled = $year
        $this.IsIlluminated = $false
    }

    [string]Illuminate([LightSource]$light) {
        $this.IsIlluminated = $true
        $intensity = [int]$light * 33
        return "[$($this.Name)] glows under $($light) light — intensity: $intensity%"
    }

    [string]Describe() {
        if ($this.IsIlluminated) {
            return "$($this.Name) shines brilliantly in $($this.PrimaryColor)."
        }
        return "$($this.Name) waits quietly for the sun."
    }
}

# ─── Functions ───────────────────────────────────────────────────────────

function Invoke-LightSimulation {
    [CmdletBinding()]
    param (
        [Parameter(ValueFromPipeline = $true)]
        [GlassColor]$Color,

        [ValidateRange(0, 100)]
        [int]$Opacity = 75
    )

    process {
        $simulated = @{
            Color  = $Color.ToString()
            Hex    = switch ($Color) {
                'ChartresBlue'  { '#1A5C8A' }
                'DeepAzure'     { '#003366' }
                'RubyRed'       { '#9B1B1B' }
                'AmberGold'     { '#C8922A' }
                default         { '#888888' }
            }
            Brightness = [math]::Round($Opacity * 1.35, 1)
        }
        [PSCustomObject]$simulated
    }
}

function Get-StainedGlassInventory {
    <#
    .SYNOPSIS
        Retrieves the cathedral's stained glass panel catalog.
    .DESCRIPTION
        Queries a mock data source (hashtable) for all known panels.
    #>
    $catalog = @{
        'Rose du Nord'    = @{ Color = 'ChartresBlue'; Year = 1230; Restored = $true  }
        'Rose du Sud'     = @{ Color = 'RubyRed';      Year = 1245; Restored = $false }
        'Belle Verriere'  = @{ Color = 'DeepAzure';    Year = 1150; Restored = $true  }
        'Saint Joseph'    = @{ Color = 'AmberGold';    Year = 1320; Restored = $false }
    }

    return $catalog.GetEnumerator() | ForEach-Object {
        [PSCustomObject]@{
            Name      = $_.Key
            Color     = $_.Value.Color
            Year      = $_.Value.Year
            Restored  = $_.Value.Restored
            Age       = (Get-Date).Year - $_.Value.Year
        }
    }
}

function Test-PanelIntegrity {
    param([string]$PanelName)

    $known = Get-StainedGlassInventory | Where-Object Name -eq $PanelName
    if (-not $known) {
        throw "Panel '$PanelName' not found in the cathedral registry."
    }

    $issues = @()
    if ($known.Age -gt 800) { $issues += "Crack detected in lead came" }
    if (-not $known.Restored) { $issues += "Requires conservation treatment" }

    return $issues
}

# ─── Script Execution ───────────────────────────────────────────────────

Write-Host "Chartres Cathedral — Stained Glass Preview" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

try {
    $panel = [StainedGlassPanel]::new($WindowName, [GlassColor]::ChartresBlue, 1220)
    $result = $panel.Illuminate([LightSource]::Noon)
    Write-Host $result -ForegroundColor Yellow
}
catch {
    Write-Error "Failed to create panel: $_"
    exit 1
}
finally {
    Write-Verbose "Panel creation attempted for '$WindowName'." -Verbose:($VerboseLogging)
}

Write-Host "`n--- Inventory ---" -ForegroundColor Green
$inventory = Get-StainedGlassInventory
$inventory | Format-Table -AutoSize

Write-Host "`n--- Pipeline Color Simulation ---" -ForegroundColor Magenta
[GlassColor]::ChartresBlue, [GlassColor]::RubyRed, [GlassColor]::AmberGold |
    Invoke-LightSimulation -Opacity 80 |
    Select-Object Color, Hex, Brightness

Write-Host "`n--- Integrity Check ---" -ForegroundColor DarkYellow
$issues = Test-PanelIntegrity -PanelName $WindowName
if ($issues.Count -gt 0) {
    $issues | ForEach-Object { Write-Warning "  - $_" }
}
else {
    Write-Host "  No issues found for '$WindowName'." -ForegroundColor Green
}

Write-Host "`nDone." -ForegroundColor Cyan
