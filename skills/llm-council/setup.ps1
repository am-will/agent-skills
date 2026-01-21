$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& python "$scriptDir/scripts/llm_council.py" configure $args
