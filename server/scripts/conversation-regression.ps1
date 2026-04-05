param(
  [string]$BaseUrl = "http://127.0.0.1:8080/api/testing",
  [string]$Phone = "+6287770000001",
  [string]$ExistingOrdersPhone = "",
  [switch]$StrictExistingOrders
)

$ErrorActionPreference = "Stop"

function Assert-True {
  param(
    [bool]$Condition,
    [string]$Message
  )

  if (-not $Condition) {
    throw $Message
  }
}

function Invoke-Chat {
  param(
    [string]$PhoneNumber,
    [string]$Message,
    [bool]$Debug = $false
  )

  $body = @{
    phoneNumber = $PhoneNumber
    message = $Message
    debug = $Debug
  } | ConvertTo-Json

  return Invoke-RestMethod `
    -Uri "$BaseUrl/chat" `
    -Method POST `
    -Body $body `
    -ContentType "application/json; charset=utf-8"
}

function Delete-Conversation {
  param([string]$PhoneNumber)

  $encodedPhone = [uri]::EscapeDataString($PhoneNumber)
  Invoke-RestMethod -Uri "$BaseUrl/conversation/$encodedPhone" -Method DELETE | Out-Null
}

Write-Host "== Conversation regression harness =="
Write-Host "Base URL: $BaseUrl"
Write-Host "Phone: $Phone"

# Scenario 1: health
$health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET
Assert-True ($health.success -eq $true) "Health check failed."
Write-Host "[OK] Health check"

# Scenario 2: cleanup (idempotent run)
Delete-Conversation -PhoneNumber $Phone
if ($ExistingOrdersPhone -ne "") {
  Delete-Conversation -PhoneNumber $ExistingOrdersPhone
}
Write-Host "[OK] Conversation delete"

# Scenario 3: /reset
$resetResult = Invoke-Chat -PhoneNumber $Phone -Message "/reset" -Debug $true
Assert-True ($resetResult.success -eq $true) "Reset command failed."
Assert-True ($resetResult.response -match "reset") "Reset response does not mention reset."
Write-Host "[OK] /reset command"

# Scenario 4: minimal new-order path (3+ turns)
Delete-Conversation -PhoneNumber $Phone
$turn1 = Invoke-Chat -PhoneNumber $Phone -Message "chiffon 2"
Assert-True ($turn1.success -eq $true) "Turn 1 (products) failed."
Assert-True (-not [string]::IsNullOrWhiteSpace($turn1.response)) "Turn 1 response is empty."

$turn2 = Invoke-Chat -PhoneNumber $Phone -Message "pickup"
Assert-True ($turn2.success -eq $true) "Turn 2 (fulfillment) failed."
Assert-True (-not [string]::IsNullOrWhiteSpace($turn2.response)) "Turn 2 response is empty."

$turn3 = Invoke-Chat -PhoneNumber $Phone -Message "besok jam 10 pagi"
Assert-True ($turn3.success -eq $true) "Turn 3 (date/time) failed."
Assert-True (-not [string]::IsNullOrWhiteSpace($turn3.response)) "Turn 3 response is empty."
Write-Host "[OK] Minimal new-order path"

# Scenario 5/6: optional existing-orders gate and edit branch
if ($ExistingOrdersPhone -ne "") {
  $gateResult = Invoke-Chat -PhoneNumber $ExistingOrdersPhone -Message "halo"
  $hasGatePrompt = $gateResult.response -match "pesan baru|edit"

  if ($StrictExistingOrders) {
    Assert-True $hasGatePrompt "Existing-order gate prompt not detected."
  }

  if ($hasGatePrompt) {
    Write-Host "[OK] Existing-order gate prompt"

    $editPrompt = Invoke-Chat -PhoneNumber $ExistingOrdersPhone -Message "edit"
    Assert-True ($editPrompt.success -eq $true) "Edit intent response failed."
    Assert-True ($editPrompt.response -match "Balas nomor|ID pesanan|Pesanan kamu") "Order selection prompt not detected."
    Write-Host "[OK] Edit selection prompt"

    $selectOrder = Invoke-Chat -PhoneNumber $ExistingOrdersPhone -Message "1"
    Assert-True ($selectOrder.success -eq $true) "Order selection failed."
    Assert-True ($selectOrder.response -match "Mau tambah|ubah|hapus item|pesanan") "Edit collection response not detected."

    $confirmItems = Invoke-Chat -PhoneNumber $ExistingOrdersPhone -Message "ya"
    Assert-True ($confirmItems.success -eq $true) "Edit confirm-items branch failed."
    Assert-True ($confirmItems.response -match "sama|ubah") "Edit confirm-delivery prompt not detected."
    Write-Host "[OK] Edit confirm branch"
  } else {
    Write-Host "[SKIP] Existing-order scenarios skipped (no open orders detected)."
  }
} else {
  Write-Host "[SKIP] Existing-order scenarios skipped (ExistingOrdersPhone not provided)."
}

Write-Host "OK"
