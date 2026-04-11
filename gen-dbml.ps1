$path = "Unleashed/migration_full.sql"
$lines = Get-Content $path

$tables = [ordered]@{}
for ($i=0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match '^CREATE TABLE \[dbo\]\.\[(?<t>[^\]]+)\]\(') {
    $t = $Matches['t']
    $cols = @()
    $pkCols = @()
    $j = $i + 1
    while ($j -lt $lines.Count -and $lines[$j] -notmatch '^\) ON \[PRIMARY\]') {
      $line = $lines[$j].Trim()
      if ($line -match '^\[(?<c>[^\]]+)\]\s+\[(?<ty>[^\]]+)\](?<rest>.*)$') {
        $c = $Matches['c']
        $ty = $Matches['ty'].ToLower()
        $rest = $Matches['rest']
        $typeSuffix = ''
        if ($rest -match '^\((?<p>[^\)]+)\)') { $typeSuffix = "($($Matches['p']))" }
        $nullable = if ($rest -match 'NOT NULL') { $false } else { $true }
        $cols += [pscustomobject]@{ Name=$c; Type="$ty$typeSuffix"; Nullable=$nullable }
      }
      if ($line -match 'PRIMARY KEY') {
        $k = $j + 1
        while ($k -lt $lines.Count -and $lines[$k] -notmatch '^\)WITH|^\) ON') {
          if ($lines[$k] -match '\[(?<pk>[^\]]+)\]\s+ASC') { $pkCols += $Matches['pk'] }
          $k++
        }
      }
      $j++
    }
    $tables[$t] = [pscustomobject]@{ Columns=$cols; PkCols=($pkCols | Select-Object -Unique) }
  }
}

$fks = @()
for ($i=0; $i -lt $lines.Count; $i++) {
  if ($lines[$i] -match '^ALTER TABLE \[dbo\]\.\[(?<t>[^\]]+)\].*FOREIGN KEY\(\[(?<c>[^\]]+)\]\)') {
    $srcT = $Matches['t']
    $srcC = $Matches['c']
    for ($k=$i+1; $k -lt [Math]::Min($i+5,$lines.Count); $k++) {
      if ($lines[$k] -match '^REFERENCES \[dbo\]\.\[(?<rt>[^\]]+)\] \(\[(?<rc>[^\]]+)\]\)') {
        $fks += [pscustomobject]@{ SrcT=$srcT; SrcC=$srcC; RefT=$Matches['rt']; RefC=$Matches['rc'] }
        break
      }
    }
  }
}

$dbml = New-Object System.Collections.Generic.List[string]
$dbml.Add('// Generated from migration_full.sql')
$dbml.Add('')
foreach ($t in $tables.Keys) {
  $dbml.Add("Table $t {")
  $tbl = $tables[$t]
  foreach ($col in $tbl.Columns) {
    $attrs = @()
    if ($tbl.PkCols -contains $col.Name) { $attrs += 'pk' }
    if (-not $col.Nullable) { $attrs += 'not null' }
    if ($attrs.Count -gt 0) {
      $dbml.Add("  $($col.Name) $($col.Type) [" + ($attrs -join ', ') + "]")
    } else {
      $dbml.Add("  $($col.Name) $($col.Type)")
    }
  }
  $dbml.Add('}')
  $dbml.Add('')
}

$refSet = New-Object System.Collections.Generic.HashSet[string]
foreach ($fk in $fks) {
  $refLine = "Ref: $($fk.SrcT).$($fk.SrcC) > $($fk.RefT).$($fk.RefC)"
  if ($refSet.Add($refLine)) { $dbml.Add($refLine) }
}

$outPath = "Unleashed/schema.dbml"
$dbml | Set-Content -Path $outPath -Encoding UTF8
"Generated $outPath with $($tables.Keys.Count) tables and $($refSet.Count) refs."
