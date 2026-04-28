$ErrorActionPreference = 'Stop'
$body = '{"email":"admin@example.com","password":"test"}'
try {
  $response = Invoke-WebRequest -Uri 'http://localhost:4000/api/auth/admin/login' -Method Post -ContentType 'application/json' -Body $body -UseBasicParsing
  Write-Output "STATUS=$($response.StatusCode)"
  Write-Output $response.Content
} catch {
  if ($_.Exception.Response) {
    $resp = $_.Exception.Response
    $stream = $resp.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $content = $reader.ReadToEnd()
    Write-Output "STATUS=$([int]$resp.StatusCode)"
    Write-Output $content
  } else {
    Write-Output $_.Exception.Message
  }
}
