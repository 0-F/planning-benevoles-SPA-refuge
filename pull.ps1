param (
    [ValidateSet("exemple", "prod", "test" )]
    [string]$env
)

Copy-Item ".clasp.$env.json" ".clasp.json" -Force
clasp pull
Remove-Item ".clasp.json"
